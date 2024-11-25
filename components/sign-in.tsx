"use client"

import { Button } from "@nextui-org/button"
import { FaGithub, FaGoogle } from "react-icons/fa"
import { useState } from "react"
import { googleSignIn, githubSignIn } from "@/app/actions/auth"
 
export default function SignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 py-8 md:py-10">
      <form
        action={googleSignIn}
        onSubmit={() => setIsGoogleLoading(true)}
        onReset={() => setIsGoogleLoading(false)}
      >
        <Button 
          startContent={!isGoogleLoading && <FaGoogle />} 
          color="primary" 
          type="submit"
          size="lg"
          isLoading={isGoogleLoading}
          disabled={isGoogleLoading || isGithubLoading}
        >
          Sign in with Google
        </Button>
      </form>

      <form
        action={githubSignIn}
        onSubmit={() => setIsGithubLoading(true)}
        onReset={() => setIsGithubLoading(false)}
      >
        <Button 
          startContent={!isGithubLoading && <FaGithub />} 
          color="default" 
          type="submit"
          size="lg"
          isLoading={isGithubLoading}
          disabled={isGoogleLoading || isGithubLoading}
        >
          Sign in with GitHub
        </Button>
      </form>
    </div>
  )
}