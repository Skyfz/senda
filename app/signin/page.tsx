"use client"
import SignIn from "@/components/sign-in";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { title } from "@/components/primitives";

export default function SignInPage() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <Card className="py-4 w-full max-w-[400px]">
                <CardHeader className="py-4 flex-col items-center pb-0">
                    <span className={title()}>Sign In</span>
                    <p className="text-tiny uppercase font-bold pt-8 pb-4">Welcome</p>
                    <small className="text-default-500">Please choose a povider</small>
                </CardHeader>
                <CardBody className="py-0">
                    <SignIn />
                </CardBody>
                </Card>
        </div>
    );
}
