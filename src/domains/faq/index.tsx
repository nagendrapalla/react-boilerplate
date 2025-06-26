import { getAxios } from "@/shared/api/apiClient";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "ti-react-template/components";
import { z } from "zod";

const faqSchema = z.array(
  z.object({
    id: z.number(),
    question: z.string(),
    answer: z.string(),
  })
);

type FAQData = z.infer<typeof faqSchema>;

async function fetchFAQs(): Promise<FAQData> {
  const response = await getAxios("/api/v0/faqs");
  return faqSchema.parse(response.data);
}

export default function FAQ(): JSX.Element {
  const { data: faqs } = useSuspenseQuery({
    queryKey: ["faqs"],
    queryFn: fetchFAQs,
  });

  if (!faqs) {
    throw ("faqs data not found");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id.toString()}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 text-gray-700 bg-gray-50">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}