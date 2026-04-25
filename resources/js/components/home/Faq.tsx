'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
    {
        q: 'What is TutStar?',
        a: 'TutStar is not just another online platform. We provide live small-batch classes (8–12 students only) with real personal teacher interaction, daily assignments, regular tests for improvement, and parent-teacher feedback, along with recordings for missed classes and continuous exam-focused learning — making study easier and more effective.',
    },
    {
        q: 'Which subjects, streams and boards do you cover?',
        a: 'We cover Maths, Science, English, Social Studies, and all Language Subjects, for CBSE, ICSE, and State Boards, across Science, Commerce, and Arts streams, with board-focused teaching and exam-oriented practice to help students excel.',
    },
    {
        q: 'How are the classes conducted?',
        a: 'All classes are live online in small batches with real 1-to-1 student-teacher interaction, allowing students to ask doubts instantly. Every class is recorded so students can revise anytime, ensuring nothing is missed.',
    },
    {
        q: 'How many students are there in a class?',
        a: 'Unlike other platforms that provide streaming classes in the name of live sessions with thousands of students, we keep very small batches of 8–12 students only, ensuring personal & real 1-to-1 interaction with effective learning for every student.',
    },
    {
        q: 'Can students ask doubts after class?',
        a: "Of course! At TutStar, students can clear doubts not only during the live class but also by using the Post Your Doubt feature after class.",
    },
];

export default function Faq() {
    return (
        <section className="w-full bg-[#FAFBFF] py-12 sm:py-16 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12">
                {/* Heading */}
                <div className="mb-10 text-center">
                    <p className="text-2xl font-bold text-neutral-800 sm:text-3xl md:text-5xl">
                        Your Doubts, Clarified..{' '}
                        <span className="text-[#FF972F]">FAQs</span>
                    </p>
                </div>

                {/* Accordion */}
                <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <AccordionItem
                            key={idx}
                            value={`item-${idx}`}
                            className="overflow-hidden rounded-2xl border border-[#E5DEFF] bg-[#F7EAFD] shadow-[0_2px_12px_rgba(103,61,230,0.08)] transition-shadow data-[state=open]:shadow-[0_6px_24px_rgba(103,61,230,0.15)]"
                        >
                            <AccordionTrigger className="px-5 py-4 text-left text-sm font-semibold text-[#673DE6] hover:no-underline sm:px-6 sm:text-base [&[data-state=open]]:text-[#4925c4]">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="px-5 pb-5 pt-0 text-sm leading-relaxed text-neutral-600 sm:px-6 sm:text-base">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
