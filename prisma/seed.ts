import path from "node:path"
import fs from "node:fs/promises"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const profilesFolder = "/Users/raneemmousa/Desktop/PhotosLinkedInButCooler/PeopleProfiles"

/**
 * Data template for fake profile creation.
 * Note: User model has bio, skills, tools - no headline/location fields.
 */
interface FakeProfile {
  name: string
  email: string
  bio: string
  skills: string[]
  tools: string[]
}

const fakeProfiles: FakeProfile[] = [
  {
    name: "Avery Quinn",
    email: "avery.quinn@example.com",
    bio: "Product Designer @ Satori Labs | Designs playful experiences blending art and utility.",
    skills: ["Figma", "Prototyping", "Design Systems", "UI/UX Design"],
    tools: ["Figma", "Sketch", "Principle", "After Effects"],
  },
  {
    name: "Riley Singh",
    email: "riley.singh@example.com",
    bio: "Creative Technologist | Explores AR storytelling and spatial computing.",
    skills: ["Unity", "C#", "WebXR", "3D Modeling"],
    tools: ["Unity", "Blender", "Three.js", "A-Frame"],
  },
  {
    name: "Jordan Martinez",
    email: "jordan.martinez@example.com",
    bio: "Full Stack Developer | Building scalable web applications with modern tech.",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    tools: ["VS Code", "Git", "Docker", "AWS"],
  },
  {
    name: "Casey Kim",
    email: "casey.kim@example.com",
    bio: "Illustrator & Digital Artist | Creating vibrant visuals for brands and publications.",
    skills: ["Digital Illustration", "Character Design", "Brand Identity"],
    tools: ["Procreate", "Adobe Illustrator", "Photoshop", "Fresco"],
  },
  {
    name: "Morgan Lee",
    email: "morgan.lee@example.com",
    bio: "Motion Graphics Designer | Bringing stories to life through animation.",
    skills: ["Motion Design", "2D Animation", "Video Editing", "Storyboarding"],
    tools: ["After Effects", "Premiere Pro", "Cinema 4D", "Illustrator"],
  },
  {
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    bio: "Frontend Developer | Crafting beautiful and accessible user interfaces.",
    skills: ["React", "TypeScript", "CSS", "Accessibility"],
    tools: ["VS Code", "Chrome DevTools", "Figma", "Storybook"],
  },
  {
    name: "Sam Chen",
    email: "sam.chen@example.com",
    bio: "UX Researcher | Understanding user needs to design better products.",
    skills: ["User Research", "Usability Testing", "Data Analysis", "Prototyping"],
    tools: ["Miro", "Figma", "UserTesting", "Hotjar"],
  },
  {
    name: "Taylor Park",
    email: "taylor.park@example.com",
    bio: "Photographer | Capturing moments and telling visual stories.",
    skills: ["Portrait Photography", "Event Photography", "Photo Editing"],
    tools: ["Lightroom", "Photoshop", "Capture One", "Canon EOS"],
  },
  {
    name: "Quinn Anderson",
    email: "quinn.anderson@example.com",
    bio: "Content Strategist | Creating engaging content that resonates with audiences.",
    skills: ["Content Writing", "SEO", "Social Media", "Brand Strategy"],
    tools: ["Notion", "Grammarly", "Canva", "Google Analytics"],
  },
  {
    name: "Blake Thompson",
    email: "blake.thompson@example.com",
    bio: "DevOps Engineer | Automating infrastructure and deployment pipelines.",
    skills: ["Kubernetes", "CI/CD", "Terraform", "Monitoring"],
    tools: ["Docker", "Kubernetes", "Jenkins", "Prometheus"],
  },
  {
    name: "Sage Williams",
    email: "sage.williams@example.com",
    bio: "Product Manager | Leading cross-functional teams to ship great products.",
    skills: ["Product Strategy", "Agile", "Stakeholder Management", "Analytics"],
    tools: ["Jira", "Figma", "Amplitude", "Notion"],
  },
  {
    name: "River Davis",
    email: "river.davis@example.com",
    bio: "3D Artist | Creating immersive environments and characters for games.",
    skills: ["3D Modeling", "Texturing", "Rigging", "Animation"],
    tools: ["Blender", "Maya", "Substance Painter", "Unreal Engine"],
  },
  {
    name: "Phoenix Brown",
    email: "phoenix.brown@example.com",
    bio: "Data Scientist | Extracting insights from complex datasets.",
    skills: ["Python", "Machine Learning", "Data Visualization", "Statistics"],
    tools: ["Jupyter", "Pandas", "TensorFlow", "Tableau"],
  },
  {
    name: "Indigo Garcia",
    email: "indigo.garcia@example.com",
    bio: "Brand Designer | Crafting visual identities that tell compelling stories.",
    skills: ["Brand Identity", "Logo Design", "Typography", "Print Design"],
    tools: ["Illustrator", "InDesign", "Photoshop", "Figma"],
  },
  {
    name: "Ocean Martinez",
    email: "ocean.martinez@example.com",
    bio: "Mobile Developer | Building native iOS and Android applications.",
    skills: ["Swift", "Kotlin", "React Native", "Mobile UI/UX"],
    tools: ["Xcode", "Android Studio", "Figma", "Firebase"],
  },
  {
    name: "Sky Johnson",
    email: "sky.johnson@example.com",
    bio: "Video Editor | Producing engaging video content for digital platforms.",
    skills: ["Video Editing", "Color Grading", "Motion Graphics", "Sound Design"],
    tools: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Audition"],
  },
  {
    name: "Luna White",
    email: "luna.white@example.com",
    bio: "UI Designer | Designing intuitive interfaces for web and mobile.",
    skills: ["UI Design", "Design Systems", "Prototyping", "User Testing"],
    tools: ["Figma", "Sketch", "Principle", "Maze"],
  },
  {
    name: "Nova Harris",
    email: "nova.harris@example.com",
    bio: "Backend Developer | Building robust APIs and microservices.",
    skills: ["Python", "Django", "PostgreSQL", "REST APIs"],
    tools: ["PyCharm", "Postman", "Docker", "Redis"],
  },
  {
    name: "Atlas Clark",
    email: "atlas.clark@example.com",
    bio: "Game Developer | Creating interactive experiences and gameplay mechanics.",
    skills: ["Unity", "C#", "Game Design", "3D Graphics"],
    tools: ["Unity", "Blender", "Visual Studio", "Git"],
  },
  {
    name: "Zephyr Lewis",
    email: "zephyr.lewis@example.com",
    bio: "Creative Director | Leading creative teams to deliver exceptional work.",
    skills: ["Creative Direction", "Team Leadership", "Brand Strategy", "Art Direction"],
    tools: ["Figma", "Adobe Creative Suite", "Notion", "Miro"],
  },
]

/**
 * Read profile photos from peopleprofiles folder.
 */
async function readProfilePhotos() {
  try {
    const files = await fs.readdir(profilesFolder)
    return files.filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
  } catch (error) {
    console.warn("⚠️ Unable to load local profile photos:", error)
    return []
  }
}

/**
 * Seed fake users with profiles, posts, and connections.
 */
async function seedFakeProfiles() {
  const photos = await readProfilePhotos()
  const users = []

  for (let i = 0; i < fakeProfiles.length; i++) {
    const profile = fakeProfiles[i]
    const photoFile = photos[i % photos.length] || null
    const imagePath = photoFile
      ? `/mock-images/${encodeURIComponent(photoFile)}`
      : null

    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        name: profile.name,
        email: profile.email,
        image: imagePath,
        bio: profile.bio,
        skills: profile.skills,
        tools: profile.tools,
      },
    })

    users.push(user)
    console.log(`✅ Created/updated user: ${user.name}`)
  }

  return users
}

/**
 * Create follow relationships between users (each user follows ~5 others).
 */
async function seedConnections(users: Array<{ id: string }>) {
  console.log("\n🔗 Creating connections...")
  let connectionCount = 0

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    // Each user follows 3-7 other users
    const numFollows = Math.floor(Math.random() * 5) + 3
    const followedIndices = new Set<number>()

    while (followedIndices.size < numFollows) {
      const randomIndex = Math.floor(Math.random() * users.length)
      if (randomIndex !== i && !followedIndices.has(randomIndex)) {
        followedIndices.add(randomIndex)
      }
    }

    for (const followedIndex of followedIndices) {
      try {
        await prisma.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: users[followedIndex].id,
            },
          },
          update: {},
          create: {
            followerId: user.id,
            followingId: users[followedIndex].id,
          },
        })
        connectionCount++
      } catch (error) {
        // Ignore duplicate errors
      }
    }
  }

  console.log(`✅ Created ${connectionCount} connections`)
}

/**
 * Create sample conversations and messages between users.
 */
async function seedConversations(users: Array<{ id: string }>) {
  console.log("\n💬 Creating conversations...")
  let conversationCount = 0
  let messageCount = 0

  // Create conversations between ~30% of user pairs
  const numConversations = Math.floor((users.length * (users.length - 1)) / 2 * 0.3)

  const createdPairs = new Set<string>()

  for (let i = 0; i < numConversations && createdPairs.size < numConversations; i++) {
    let user1Index = Math.floor(Math.random() * users.length)
    let user2Index = Math.floor(Math.random() * users.length)

    while (user1Index === user2Index) {
      user2Index = Math.floor(Math.random() * users.length)
    }

    const pairKey = [user1Index, user2Index].sort().join("-")
    if (createdPairs.has(pairKey)) continue
    createdPairs.add(pairKey)

    const user1 = users[user1Index]
    const user2 = users[user2Index]

    try {
      const u1Id = user1.id < user2.id ? user1.id : user2.id
      const u2Id = user1.id < user2.id ? user2.id : user1.id

      // Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { user1Id: u1Id, user2Id: u2Id },
            { user1Id: u2Id, user2Id: u1Id },
          ],
        },
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            user1Id: u1Id,
            user2Id: u2Id,
          },
        })
      }

      conversationCount++

      // Add 2-5 messages to each conversation
      const numMessages = Math.floor(Math.random() * 4) + 2
      const sampleMessages = [
        "Hey! How's it going?",
        "I saw your latest post, really cool work!",
        "Would love to connect and work together.",
        "Thanks for the follow!",
        "Let's connect and chat about opportunities.",
        "Your portfolio looks amazing!",
        "Interested in your thoughts on the latest design trends.",
      ]

      for (let j = 0; j < numMessages; j++) {
        const sender = j % 2 === 0 ? user1 : user2
        const messageText = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: sender.id,
            content: messageText,
            read: j < numMessages - 1, // Last message is unread
          },
        })
        messageCount++
      }
    } catch (error) {
      // Ignore duplicate errors
    }
  }

  console.log(`✅ Created ${conversationCount} conversations with ${messageCount} messages`)
}

async function main() {
  console.log("🌱 Seeding fake profiles...")
  const users = await seedFakeProfiles()
  console.log(`✅ Seeded ${users.length} fake users`)

  await seedConnections(users)
  await seedConversations(users)

  console.log("\n✨ Seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

