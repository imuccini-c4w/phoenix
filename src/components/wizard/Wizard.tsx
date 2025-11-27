"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Step1AccountInfo } from "./Step1AccountInfo"
import { Step2Verification } from "./Step2Verification"
import { Step3Password } from "./Step3Password"
import { Step4BusinessInfo } from "./Step4BusinessInfo"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Define the schema for the entire form
const wizardSchema = z.object({
    // Step 1
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    workEmail: z.string().email("Invalid email address").refine((email) => {
        const freeProviders = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"]
        const domain = email.split("@")[1]
        return !freeProviders.includes(domain)
    }, "Please use a work email address"),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the conditions"),

    // Step 2
    verificationCode: z.string().length(6, "Code must be 6 digits"),

    // Step 3
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),

    // Step 4
    companyName: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type WizardFormData = z.infer<typeof wizardSchema>

export function Wizard() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const methods = useForm<WizardFormData>({
        resolver: zodResolver(wizardSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            workEmail: "",
            acceptTerms: false,
            verificationCode: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            industry: "",
            country: "",
            website: "",
        }
    })

    const nextStep = () => setStep((s) => Math.min(s + 1, 4))
    const prevStep = () => setStep((s) => Math.max(s - 1, 1))

    const onSubmit = (data: WizardFormData) => {
        // Format the final output
        const finalOutput = {
            firstName: data.firstName,
            lastName: data.lastName,
            workEmail: data.workEmail,
            password: data.password, // In a real app, this would be hashed or handled securely
            isDomainConditionsAccepted: data.acceptTerms,
            business: {
                companyName: data.companyName || "",
                industry: data.industry || "",
                country: data.country || "",
                website: data.website || "",
            }
        }

        console.log("Final JSON Output:", JSON.stringify(finalOutput, null, 2))
        alert("Account creation successful! Check console for JSON output.")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
                {/* Left Side - Form */}
                <div className="p-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                <span>Step {step} of 4</span>
                                <span>{Math.round((step / 4) * 100)}%</span>
                            </div>
                            <Progress value={(step / 4) * 100} className="h-2" />
                        </div>

                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                                {step === 1 && <Step1AccountInfo onNext={nextStep} />}
                                {step === 2 && <Step2Verification onNext={nextStep} onBack={prevStep} />}
                                {step === 3 && <Step3Password onNext={nextStep} onBack={prevStep} />}
                                {step === 4 && <Step4BusinessInfo onBack={prevStep} />}
                            </form>
                        </FormProvider>
                    </div>
                </div>

                {/* Right Side - Visual/Context */}
                <div className="hidden md:block bg-slate-900 relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
                    <div className="relative h-full flex flex-col justify-end p-12 text-white">
                        <div className="space-y-4">
                            <div className="mb-6">
                                <img
                                    src="/cloud4wi_logo_white.svg"
                                    alt="Cloud4Wi Logo"
                                    className="h-8 w-auto"
                                />
                            </div>
                            <h2 className="text-3xl font-bold">Let's get started with Guest WiFi.</h2>
                            <p className="text-gray-300 text-lg">
                                Elevate your guest WiFi experience for free in a few minutes!.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
