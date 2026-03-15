import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/role"
import { requireApiUser } from "../_auth"

export async function GET(){

 const { session, error } = await requireApiUser()
 if(error) return error

 const where = isAdminRole(session.user.role) ? {} : { userId: session.user.id }

 const schedule = await prisma.schedule.findMany({
  where,
  include:{ user:true }
 })

 return NextResponse.json(schedule)

}

export async function POST(req:Request){

 const { session, error } = await requireApiUser()
 if(error) return error

 const data = await req.json()

 const userId = isAdminRole(session.user.role) && data.userId ? data.userId : session.user.id

 const schedule = await prisma.schedule.create({
  data:{
   date:new Date(data.date),
   status:data.status,
   userId
  }
 })

 return NextResponse.json(schedule)

}
