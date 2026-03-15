import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

const handler = NextAuth({

 providers:[

  CredentialsProvider({

   name:"credentials",

   credentials:{
    email:{},
    password:{}
   },

   async authorize(credentials){

    const user = await prisma.user.findUnique({
     where:{ email: credentials?.email }
    })

    if(!user) return null

    const valid = await bcrypt.compare(
     credentials!.password,
     user.password
    )

    if(!valid) return null

    return user

   }

  })

 ],

 session:{
  strategy:"jwt"
 }

})

export { handler as GET, handler as POST }