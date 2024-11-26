"use client"

import { Button } from "@nextui-org/button"
import { FaGithub, FaGoogle } from "react-icons/fa"
import { useState } from "react"
import { googleSignIn, githubSignIn } from "@/app/actions/auth"
 
export default function SignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)

  return (
    <div className="w-full flex flex-col gap-4 py-8 md:py-10">
      <form
        action={googleSignIn}
        onSubmit={() => setIsGoogleLoading(true)}
        onReset={() => setIsGoogleLoading(false)}
      >
        <Button 
          startContent={!isGoogleLoading && <FaGoogle className="text-lg" />} 
          color="primary" 
          type="submit"
          size="lg"
          className="w-full font-medium"
          isLoading={isGoogleLoading}
          disabled={isGoogleLoading || isGithubLoading}
          variant="shadow"
        >
          <span className="hidden sm:inline">Continue with </span>Google
        </Button>
      </form>

      <form
        action={githubSignIn}
        onSubmit={() => setIsGithubLoading(true)}
        onReset={() => setIsGithubLoading(false)}
      >
        <Button 
          startContent={!isGithubLoading && <FaGithub className="text-lg" />} 
          color="default" 
          type="submit"
          size="lg"
          className="w-full font-medium"
          isLoading={isGithubLoading}
          disabled={isGoogleLoading || isGithubLoading}
          variant="bordered"
        >
          <span className="hidden sm:inline">Continue with </span>GitHub
        </Button>
      </form>
    </div>
  )
}