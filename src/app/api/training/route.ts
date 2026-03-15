import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/role"
import { requireApiUser } from "../_auth"

export async function GET(){

 const { session, error } = await requireApiUser()
 if(error) return error

 const where = isAdminRole(session.user.role) ? {} : { dog:{ ownerId: session.user.id } }

 const training = await prisma.trainingSession.findMany({
  where,
  include:{ dog:true }
 })

 return NextResponse.json(training)

}

export async function POST(req:Request){

 const { session, error } = await requireApiUser()
 if(error) return error

 const data = await req.json()

 // valida se o cão pertence ao usuário quando não é admin
 if(!isAdminRole(session.user.role)){
  const dog = await prisma.dog.findUnique({ where:{ id:data.dogId } })
  if(!dog || dog.ownerId !== session.user.id){
   return NextResponse.json({success:false,message:"Sem permissão para registrar treino para este cão"},{status:403})
  }
 }

 const training = await prisma.trainingSession.create({
  data:{
   title:data.title,
   description:data.description,
   progress:Number(data.progress),
   dogId:data.dogId
  }
 })

 return NextResponse.json(training)

}
