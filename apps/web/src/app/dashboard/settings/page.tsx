'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/auth-context';
import { PreferencesCard } from '@/features/settings/components/PreferencesCard';
import { ProfileForm } from '@/features/settings/components/ProfileForm';
import { Emph } from '@/shared/components/Emph';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[860px]"
    >
      <PageHeader
        eyebrow="Account"
        title={
          <>
            <Emph>Settings</Emph>
          </>
        }
        description="Your profile, your notifications, and (for admins) the church record itself."
      />

      <motion.div variants={fadeUp} className="mt-8">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <section className="rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8">
              <ProfileForm
                defaultValues={{
                  firstName: user.firstName ?? '',
                  lastName: user.lastName ?? '',
                  email: user.email,
                }}
              />
            </section>
          </TabsContent>

          <TabsContent value="notifications">
            <PreferencesCard />
          </TabsContent>

          <TabsContent value="security">
            <section className="rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8">
              <h2 className="font-display text-[18px] text-foreground">
                Sign-in
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Update your password or review recent sessions.
              </p>
              <ul className="mt-5 space-y-2 text-[13px] text-foreground">
                <li className="flex items-center justify-between rounded-[var(--radius-cardinner)] bg-muted px-3 py-2">
                  <span>This device · Accra</span>
                  <span className="text-[11px] text-muted-foreground">
                    Active now
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-[var(--radius-cardinner)] bg-muted px-3 py-2">
                  <span>Mac · Chrome · Accra</span>
                  <span className="text-[11px] text-muted-foreground">
                    2 days ago
                  </span>
                </li>
              </ul>
            </section>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
