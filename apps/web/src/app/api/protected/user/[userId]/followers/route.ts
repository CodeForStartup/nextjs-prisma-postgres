import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"

import prisma from "database"

import { auth } from "@/configs/auth"

export async function GET(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params
  const { userId } = params

  try {
    const users = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followingId: userId,
          },
        },
      },
    })

    if (!users) {
      return Response.json({ message: "User not found" }, { status: 404 })
    }

    return Response.json(users, { status: 200 })
  } catch (error) {
    return Response.error()
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params
  const { userId } = params
  const data = await request.json()

  const session = await auth()
  if (!session) {
    return new Response(null, { status: 403 })
  }

  try {
    const isFollowing = await prisma.follower.findFirst({
      where: {
        followerId: session?.user?.id,
        followingId: data?.followerId,
      },
    })

    if (!isFollowing) {
      await prisma.follower.create({
        data: {
          followerId: session?.user?.id,
          followingId: data?.followerId,
        },
      })
    } else {
      await prisma.follower.deleteMany({
        where: {
          followerId: session?.user?.id,
          followingId: data?.followerId,
        },
      })
    }
    revalidatePath(`/author/${userId}/followers`)

    return Response.json({ message: "Success" }, { status: 200 })
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
