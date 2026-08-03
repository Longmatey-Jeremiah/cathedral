'use client';

import { motion } from 'framer-motion';
import { Emph } from '@/components/Emph';
import { PageHeader } from '@/components/admin/PageHeader';
import { AssistantChat } from '@/components/assistant/AssistantChat';
import { stagger } from '@/shared/lib/motion';

export default function AssistantPage() {
  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="Claude · streaming"
        title={
          <>
            <Emph>Assistant</Emph>
          </>
        }
        description="Draft messages, plan a cadence, or think a decision through. Conversations are not saved."
      />

      <div className="mt-8">
        <AssistantChat />
      </div>
    </motion.div>
  );
}
