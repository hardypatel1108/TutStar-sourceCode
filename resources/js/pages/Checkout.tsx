'use client';
import subscriptionflare from '@/assets/images/checkout/subscription-flare.png';
import subscriptionimg from '@/assets/images/checkout/subscription-img-1.png';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import { BadgePercent, Check } from 'lucide-react';
import { useState } from 'react';
interface Plan {
    id: number;
    title: string;
    price: number;
    duration_days: number;
    ongoing_batches: number;
    type: string;
    status: string;
    board?: string;
    class?: string;
    subjects?: { name: string }[];
    offers?: { id: number }[];
}

export default function Checkout({ plan }: Plan) {
    const { props } = usePage() as any;
    const csrfFromProps = props?.csrf_token || '';
    const basePrice = Number(plan.price);
    const dynamicPlans = plan.checkoutPlans.map((cp) => {
        let total = basePrice * cp.months;
        let saveLabel = null;

        if (cp.offers && cp.offers.length > 0) {
            const offer = cp.offers[0]; // assuming 1 active offer per checkout plan
            if (offer.type === 'percentage') {
                const discountAmount = (total * Number(offer.value)) / 100;
                total = total - discountAmount;
                saveLabel = `Save ${Number(offer.value)}%`;
            } else if (offer.type === 'fixed' || offer.type === 'flat') {
                total = total - Number(offer.value);
                saveLabel = `Save ?${Number(offer.value)}`;
            }
        }

        return {
            id: cp.id,
            label: cp.title,
            months: cp.months,
            price: Math.round(total),
            save: saveLabel,
        };
    });
    const [selectedPlan, setSelectedPlan] = useState(plan.checkoutPlans[0]?.id ?? null);

    //  ADD HERE
    const selectedCp = plan.checkoutPlans.find((cp) => cp.id === selectedPlan);

    const baseFees = basePrice * selectedCp?.months;

    // Checkout offer discount
    let checkoutDiscount = 0;
    let checkoutDiscountTitle = 'Main Plan Offer';

    if (selectedCp.offers && selectedCp.offers.length > 0) {
        const offer = selectedCp.offers[0];
        const formattedTitle = offer.title.replace(/\b\w/g, (c) => c.toUpperCase());

        if (offer.type === 'percentage') {
            checkoutDiscount = (baseFees * Number(offer.value)) / 100;
            checkoutDiscountTitle = `${formattedTitle} (${Number(offer.value)}% off)`;
        } else if (offer.type === 'fixed' || offer.type === 'flat') {
            checkoutDiscount = Number(offer.value);
            checkoutDiscountTitle = `${formattedTitle} (\u20B9${Number(offer.value)} off)`;
        }
    }

    // Plan-level offer discount
    let planDiscount = 0;
    let planDiscountTitle = 'Main Plan Offer';

    if (plan.offers && plan.offers.length > 0) {
        const offer = plan.offers[0];
        const formattedTitle = offer.title.replace(/\b\w/g, (c) => c.toUpperCase());
        if (offer.type === 'percentage') {
            planDiscount = (baseFees * Number(offer.value)) / 100;
            planDiscountTitle = `${formattedTitle} (${Number(offer.value)}% off)`;
        } else if (offer.type === 'fixed' || offer.type === 'flat') {
            planDiscount = Number(offer.value);
            planDiscountTitle = `${formattedTitle} (\u20B9${Number(offer.value)} off)`;
        }
    }

    // Final calculation
    const finalTotal = Math.round(baseFees - checkoutDiscount - planDiscount);
    const totalSavings = Math.round(checkoutDiscount + planDiscount);

    const pay = async () => {
        const getCsrfToken = () => {
            const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            if (meta?.content) {
                return meta.content;
            }
            return csrfFromProps || (window as any).Laravel?.csrfToken || '';
        };

        let tokenValue = getCsrfToken();
        try {
            const res = await fetch('/csrf-token', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data?.token) tokenValue = data.token;
            }
        } catch {}

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/phonepe/create';

        // CSRF token
        const token = document.createElement('input');
        token.type = 'hidden';
        token.name = '_token';
        token.value = tokenValue;
        form.appendChild(token);

        const checkoutPlan = document.createElement('input');
        checkoutPlan.type = 'hidden';
        checkoutPlan.name = 'checkout_plan_id';
        checkoutPlan.value = String(selectedPlan);
        form.appendChild(checkoutPlan);

        document.body.appendChild(form);
        form.submit(); // ? THIS forces browser to leave SPA and follow redirect
    };

    return (
        <>
            <Head title="Plans" />

            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="mt-5 flex min-h-fit flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <section className="relative overflow-hidden dark:text-gray-400">
                    {/* Background flares */}
                    <img
                        src={subscriptionflare}
                        className="pointer-events-none absolute top-1/2 left-0 hidden h-[300px] -translate-y-1/2 opacity-60 sm:block"
                        alt=""
                    />
                    <img
                        src={subscriptionflare}
                        className="pointer-events-none absolute top-1/2 right-0 hidden h-[300px] -translate-y-1/2 rotate-180 opacity-60 sm:block"
                        alt=""
                    />

                    {/* CONTENT WRAPPER */}
                    <div className="customContainer relative z-10 grid gap-10 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-2 md:place-items-center md:py-16">
                        {/* LEFT ILLUSTRATION (desktop only) */}
                        <div className="hidden justify-center md:flex">
                            <div className="relative aspect-square h-[240px] rounded-3xl border border-[#E6E0FF] bg-[#F3F0FF] shadow-[0_12px_30px_rgba(103,61,230,0.12)] [background-image:linear-gradient(#EDEBFF_1px,transparent_1px),linear-gradient(90deg,#EDEBFF_1px,transparent_1px)] [background-size:40px_40px] md:h-[280px] lg:h-[320px]">
                                <img
                                    src={subscriptionimg}
                                    className="absolute bottom-0 left-1/2 z-10 w-[130%] max-w-[350px] -translate-x-1/2 object-contain"
                                    alt="Subscription Illustration"
                                />
                            </div>
                        </div>

                        {/* RIGHT PLAN SELECTOR */}
                        <div className="flex w-full flex-col items-center gap-4">
                            <h2 className="w-full text-center text-lg font-semibold text-black">Subscription</h2>
                            <Card className="w-full rounded-2xl border-0 shadow-[0_10px_30px_rgba(103,61,230,0.25)] sm:w-[420px] md:w-[440px]">
                                <CardContent className="space-y-5 p-4 sm:p-6">
                                    {/* PLAN OPTIONS */}
                                    <div className="space-y-3">
                                        {dynamicPlans.map((plan) => {
                                            return (
                                                <label
                                                    key={plan.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                                                        selectedPlan === plan.id
                                                            ? 'bg-gradient-to-r from-[#E9A7FF] to-[#FFA45B] text-black shadow-[0_4px_12px_rgba(255,164,91,0.25)] border border-[#E9A7FF]'
                                                            : 'bg-[#F3F4F6] text-black border border-[#E5E7EB]'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="plan"
                                                        className="hidden"
                                                        checked={selectedPlan === plan.id}
                                                        onChange={() => setSelectedPlan(plan.id)}
                                                    />
                                                    {/* CUSTOM RADIO WITH TICK */}
                                                    <div
                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                                                            selectedPlan === plan.id
                                                                ? 'border-transparent bg-[#22C55E]'
                                                                : 'border-[#D1D5DB] bg-white'
                                                        }`}
                                                    >
                                                        {selectedPlan === plan.id && (
                                                            <Check className="h-4 w-4 font-extrabold text-[#ffffff]" strokeWidth={3} />
                                                        )}
                                                    </div>
                                                    <div className="flex w-full flex-col gap-1">
                                                        {/* Save Tag + Original Total */}
                                                        {plan.save && (
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="font-medium text-[#3B5BFF]">{plan.save}</span>
                                                                <span className="text-black/70">
                                                                    {plan.months} x {'\u20B9'}{basePrice} ={' '}
                                                                    <span className="text-[#FF3B30] line-through">
                                                                        {'\u20B9'}{basePrice * plan.months}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Label + Price */}
                                                        <p className="flex justify-between text-sm font-semibold sm:text-base">
                                                            <span className="text-black">{plan.months} Month</span>
                                                            <span className="text-black">
                                                                Total {'\u20B9'}{plan.price}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* DIVIDER */}
                                    <div className="my-3 border-b border-gray-200"></div>

                                    {/* Fees Section */}
                                    <div className="space-y-2 text-sm sm:text-base dark:text-gray-400">
                                        <p className="flex justify-between">
                                            <span>Fees</span>
                                            <span>{'\u20B9'}{baseFees}</span>
                                        </p>

                                        {checkoutDiscount > 0 && (
                                            <p className="flex justify-between">
                                                <span>{checkoutDiscountTitle}</span>
                                                <span className="text-green-600">-{'\u20B9'}{Math.round(checkoutDiscount)}</span>
                                            </p>
                                        )}

                                        {planDiscount > 0 && (
                                            <p className="flex justify-between">
                                                <span>{planDiscountTitle}</span>
                                                <span className="text-green-600">-{'\u20B9'}{Math.round(planDiscount)}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="my-3 border-b border-gray-200"></div>

                                    {/* TOTAL */}
                                    <p className="flex justify-between text-base font-semibold sm:text-lg">
                                        <span>Total</span>
                                        <span>{'\u20B9'}{finalTotal}</span>
                                    </p>

                                    {/* SAVINGS BANNER */}
                                    {totalSavings > 0 && (
                                        <p className="mt-3 flex items-center justify-center rounded-lg bg-[#D9F0C5] py-2 text-sm text-[#609E29]">
                                            <BadgePercent className="mr-1 h-5 w-5" />
                                            You’ll save {'\u20B9'}{totalSavings} on this!
                                        </p>
                                    )}

                                </CardContent>
                            </Card>
                            <div className="text-center">
                                <Button
                                    onClick={pay}
                                    className="rounded-2xl bg-gradient-to-b from-[#FFDB7A] to-[#FF8800] px-8 py-3 text-base text-white disabled:opacity-50 sm:text-lg"
                                    disabled={selectedPlan === null}
                                >
                                    Get Subscription
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}

