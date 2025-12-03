import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedNotifications() {
  console.log("\n🔔 Seeding fake notifications...")

  try {
    // Get all users
    const users = await prisma.user.findMany()
    if (users.length < 2) {
      console.error("Need at least 2 users to create notifications. Please seed users first.")
      return
    }

    // Try to find Raneem Mousa first, otherwise use first user with posts
    let currentUser = users.find(u => u.name?.toLowerCase().includes("raneem")) || users[0]
    let posts = await prisma.post.findMany({
      where: { authorId: currentUser.id },
      take: 10,
    })

    // If user has no posts, find any user with posts
    if (posts.length === 0) {
      const postsWithAuthors = await prisma.post.findMany({
        take: 20,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (postsWithAuthors.length === 0) {
        console.error("No posts found in database. Please create some posts first.")
        return
      }

      // Group posts by author and pick the author with most posts
      const postsByAuthor = postsWithAuthors.reduce((acc, post) => {
        if (!acc[post.authorId]) {
          acc[post.authorId] = []
        }
        acc[post.authorId].push(post)
        return acc
      }, {} as Record<string, typeof postsWithAuthors>)

      const authorWithMostPosts = Object.entries(postsByAuthor).sort(
        (a, b) => b[1].length - a[1].length
      )[0]

      currentUser = users.find(u => u.id === authorWithMostPosts[0]) || users[0]
      posts = authorWithMostPosts[1].slice(0, 10)
      
      console.log(`Using posts from ${currentUser.name} (${posts.length} posts)`)
    } else {
      console.log(`Found ${posts.length} posts from ${currentUser.name}`)
    }

    // Get other users (excluding the current user)
    const otherUsers = users.filter(u => u.id !== currentUser.id)

    if (otherUsers.length === 0) {
      console.error("No other users found. Please seed more users first.")
      return
    }

    console.log(`Found ${posts.length} posts from ${currentUser.name}`)
    console.log(`Found ${otherUsers.length} other users`)

    let notificationCount = 0

    // Create notifications for likes on posts
    for (const post of posts) {
      // Randomly select 2-5 users to "like" this post
      const numLikers = Math.floor(Math.random() * 4) + 2 // 2-5 users
      const likers = otherUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numLikers, otherUsers.length))

      for (const liker of likers) {
        try {
          // Check if notification already exists
          const existing = await prisma.notification.findFirst({
            where: {
              type: "like",
              recipientId: currentUser.id,
              senderId: liker.id,
              postId: post.id,
            },
          })

          if (existing) {
            continue // Skip if already exists
          }

          // Create the notification
          await prisma.notification.create({
            data: {
              type: "like",
              recipientId: currentUser.id,
              senderId: liker.id,
              postId: post.id,
              read: Math.random() > 0.7, // 30% chance of being read
            },
          })

          notificationCount++
          console.log(`✅ Created notification: ${liker.name} liked ${currentUser.name}'s post`)
        } catch (error: any) {
          // Check if Notification table doesn't exist
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            console.error("❌ Notification table does not exist. Please run database migration first.")
            return
          }
          console.error(`❌ Failed to create notification:`, error)
        }
      }
    }

    // Create some "connect" notifications (people wanting to keep in touch)
    const connectUsers = otherUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, otherUsers.length))

    for (const connectUser of connectUsers) {
      try {
        // Check if notification already exists
        const existing = await prisma.notification.findFirst({
          where: {
            type: "connect",
            recipientId: currentUser.id,
            senderId: connectUser.id,
          },
        })

        if (existing) {
          continue
        }

        await prisma.notification.create({
          data: {
            type: "connect",
            recipientId: currentUser.id,
            senderId: connectUser.id,
            read: Math.random() > 0.8, // 20% chance of being read
          },
        })

        notificationCount++
        console.log(`✅ Created notification: ${connectUser.name} wants to keep in touch`)
      } catch (error: any) {
        if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
          console.error("❌ Notification table does not exist. Please run database migration first.")
          return
        }
        console.error(`❌ Failed to create notification:`, error)
      }
    }

    console.log(`\n✨ Created ${notificationCount} notifications`)
  } catch (error) {
    console.error("❌ Error seeding notifications:", error)
  }
}

async function main() {
  await seedNotifications()
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

