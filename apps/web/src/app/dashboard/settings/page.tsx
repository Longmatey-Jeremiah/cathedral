'use client';

import { motion } from 'framer-motion';
import { UserRole } from '@/shared/lib/types';
import { useAuth } from '@/hooks/auth-context';
import { useHasRole } from '@/hooks/auth';
import { BranchSettingsCard } from '@/components/settings/BranchSettingsCard';
import { DeliveryPreferencesCard } from '@/components/settings/DeliveryPreferencesCard';
import { PreferencesCard } from '@/components/settings/PreferencesCard';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { SessionsList } from '@/components/settings/SessionsList';
import { Emph } from '@/components/Emph';
import { PageHeader } from '@/components/admin/PageHeader';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function SettingsPage() {
  const { user } = useAuth();
  const canEditBranch = useHasRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
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
            {canEditBranch ? (
              <TabsTrigger value="branch">Branch</TabsTrigger>
            ) : null}
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

          {canEditBranch ? (
            <TabsContent value="branch">
              <BranchSettingsCard />
            </TabsContent>
          ) : null}

          <TabsContent value="notifications" className="space-y-6">
            <DeliveryPreferencesCard />
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
              <SessionsList />
            </section>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
