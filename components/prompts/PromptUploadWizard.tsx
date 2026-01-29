'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Upload, CheckCircle2, ChevronRight, Wand2, Image as ImageIcon, Layout, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitPublicPrompt } from '@/actions/prompts';
import { cn } from '@/lib/utils';

interface WizardProps {
    lang: string;
    categories: any[];
    dict: any;
}

export function PromptUploadWizard({ lang, categories, dict }: WizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        model: 'ChatGPT',
        category: '',
        categoryId: '',
        content: '',
        description: '',
        beforeImage: '',
        afterImage: '',
    });

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'categoryId') {
            const cat = categories.find(c => c.id === value);
            if (cat) setFormData(prev => ({ ...prev, category: cat.name }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setMessage('');
        setErrors({});

        const submissionData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            submissionData.append(key, value);
        });
        submissionData.append('lang', lang);

        const result = await submitPublicPrompt({}, submissionData);

        if (result.errors) {
            setErrors(result.errors);
            setIsSubmitting(false);
            // Jump to step with errors if needed, but let's just show them
        } else if (result.success) {
            setMessage(result.message || 'Success');
            setStep(4); // Success step
            setTimeout(() => {
                router.push(`/${lang === 'en' ? '' : lang}`);
            }, 3000);
        } else {
            setMessage(result.message || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, name: 'Basic Details', icon: Layout },
        { id: 2, name: 'Prompt Content', icon: Type },
        { id: 3, name: 'Visuals', icon: ImageIcon },
    ];

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 whitespace-normal">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center flex-1 last:flex-none">
                            <div className={cn(
                                "flex flex-col items-center gap-2 transition-all duration-300",
                                step === s.id ? "text-primary" : step > s.id ? "text-emerald-500" : "text-muted-foreground"
                            )}>
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                    step === s.id ? "border-primary bg-primary/10 scale-110 shadow-lg shadow-primary/20" :
                                        step > s.id ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-muted/50"
                                )}>
                                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{s.name}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="flex-1 mx-4 h-[2px] bg-muted overflow-hidden rounded-full">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{ width: step > s.id ? "100%" : "0%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-black text-foreground mb-2">Share Your Brilliance</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Help others create amazing things with your prompts</p>
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Title for your prompt</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Cinematic Portrait Lighting"
                                        className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-4 transition-all text-lg font-bold"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs font-bold mt-1">{errors.title[0]}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">AI Model</label>
                                        <select
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-4 appearance-none font-bold"
                                        >
                                            <option>ChatGPT</option>
                                            <option>Midjourney</option>
                                            <option>DALL-E 3</option>
                                            <option>Claude</option>
                                            <option>Stable Diffusion</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-4 appearance-none font-bold"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-xs font-bold mt-1">{errors.category[0]}</p>}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={!formData.title || !formData.categoryId}
                                className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                            >
                                Continue to Content <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Short Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Briefly explain what this prompt does..."
                                        className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-4 transition-all font-medium resize-none"
                                    />
                                    {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground italic flex items-center gap-2">
                                        <Wand2 className="w-3.5 h-3.5 text-primary" /> The Secret formula (The Prompt)
                                    </label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        rows={6}
                                        placeholder="Paste your prompt here. You can use [VARIABLES] if needed."
                                        className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-4 font-mono text-sm leading-relaxed transition-all"
                                    />
                                    {errors.content && <p className="text-red-500 text-xs font-bold mt-1">{errors.content[0]}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 py-5 bg-muted/50 border border-border rounded-2xl font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.content || !formData.description}
                                    className="flex-[2] py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    Add Visuals <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="w-full aspect-video rounded-3xl bg-muted/30 border-2 border-dashed border-border flex flex-col items-center justify-center p-4 text-center group hover:border-primary/50 transition-colors">
                                        {formData.beforeImage ? (
                                            <img src={formData.beforeImage} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Before Image URL</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="beforeImage"
                                        value={formData.beforeImage}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-xs"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="w-full aspect-video rounded-3xl bg-muted/30 border-2 border-dashed border-border flex flex-col items-center justify-center p-4 text-center group hover:border-primary/50 transition-colors">
                                        {formData.afterImage ? (
                                            <img src={formData.afterImage} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">After Image URL</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="afterImage"
                                        value={formData.afterImage}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20">
                                <p className="text-xs text-center text-primary font-bold uppercase tracking-widest leading-relaxed">
                                    Your prompt will be reviewed by our curators before becoming public.
                                    Make sure it follows our quality guidelines.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 py-5 bg-muted/50 border border-border rounded-2xl font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-primary/50 hover:shadow-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit for Approval"} <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black text-foreground">Awesome!</h2>
                            <p className="text-muted-foreground text-lg">{message}</p>
                            <div className="pt-8 flex items-center justify-center gap-2 text-primary font-bold">
                                <span>Redirecting to home</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
