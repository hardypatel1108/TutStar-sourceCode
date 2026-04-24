import StudentLayout from '@/layouts/studentLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function FeedBack() {
    const questions = [
        'Classes are useful and interesting?',
        'Are the teachers explaining clearly?',
        'Is the class timing comfortable?',
        'Are the assignments helpful?',
        'Would you recommend these classes to others?',
    ];

    return (
        <StudentLayout>
            <Head title="Feedback" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative mb-32 min-h-[100vh] rounded-2xl bg-gradient-to-b from-[#E8E5FF] to-[#FFFFFF] p-4 shadow">
                    {/* Back Button (Mobile Only) */}
                    <div className="mb-4 pt-10 md:hidden md:pt-0">
                        <Link href="/dashboard" className="flex items-center gap-1 text-xs font-medium">
                            <ArrowLeft className="inline h-3 w-3" />
                            DASHBOARD
                        </Link>
                    </div>

                    <h1 className="text-blueClr border-b border-gray-300 pb-2 text-2xl font-semibold sm:text-center md:text-4xl">Feedback</h1>

                    {/* Form */}
                    <form className="space-y-6">
                        <ol className="space-y-6 p-4">
                            {questions.map((question, qIndex) => (
                                <li key={qIndex} className="list-decimal space-y-2">
                                    <p className="text-lg font-medium">{question}</p>

                                    <div className="flex items-start justify-between gap-2 sm:gap-6">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <div className="flex flex-col items-center" key={num}>
                                                <input
                                                    type="radio"
                                                    name={`rating_${qIndex}`}
                                                    id={`q${qIndex}-point-${num}`}
                                                    value={num}
                                                    className="peer hidden"
                                                />

                                                <label
                                                    htmlFor={`q${qIndex}-point-${num}`}
                                                    className="peer-checked:bg-blueClr flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gray-300 font-medium transition peer-checked:bg-[#7a6aee] peer-checked:text-white"
                                                >
                                                    {num}
                                                </label>

                                                {(num === 1 || num === 5) && (
                                                    <p className="mt-1 text-center text-xs">{num === 1 ? 'Strongly Disagree' : 'Strongly Agree'}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ol>

                        {/* Improvement Text */}
                        <div className="mt-4">
                            <p className="mb-2 text-lg font-medium">What aspect of the classes could we improve?</p>

                            <textarea
                                name="improvement"
                                rows={5}
                                className="w-full rounded-xl border border-gray-300 p-2"
                                placeholder="Write your suggestion..."
                            ></textarea>
                        </div>

                        <div className="flex justify-center">
                            <button type="submit" className="btn bg-blueClr mt-4 rounded-2xl px-6 py-2 text-white bg-[#7a6aee]">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </StudentLayout>
    );
}
