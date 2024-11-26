"use client"
import SignIn from "@/components/sign-in";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { title } from "@/components/primitives";

export default function SignInPage() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-4">
            <Card isBlurred shadow="lg" className="py-4 w-full max-w-[400px]">
                <CardHeader className="pb-0 pt-8 px-10 flex-col items-start">
                    <h1 className={title({ size: 'sm' })}>Welcome Back</h1>
                    <p className="text-sm text-default-500 mt-1">Please sign in to continue</p>
                </CardHeader>
                <CardBody className="overflow-hidden px-12">
                    <SignIn />
                </CardBody>
            </Card>
        </div>
    );
}