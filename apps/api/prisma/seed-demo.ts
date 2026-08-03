/**
 * Demo data — 10 rows in every table.
 *
 *   npm run seed:demo -w @cmp/api
 *
 * Everything hangs off one church (the first) so the dashboard has a populated
 * tenant to render; the other nine churches exist for the platform-wide lists.
 * Ids are deterministic and every insert skips duplicates, so re-running is a
 * no-op rather than a second copy. Separate from `seed.ts`, which provisions the
 * real super admin from env secrets.
 */
import {
  AttendanceStatus,
  CareType,
  DepartmentRole,
  GivingMethod,
  MaritalStatus,
  MemberStatus,
  PrismaClient,
  Sex,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

const COUNT = 10;
const DEMO_PASSWORD = 'DemoPassword123!';

/** Deterministic uuid-shaped id: same run twice = same rows, not duplicates. */
function id(table: number, row: number): string {
  const prefix = table.toString(16).padStart(8, '0');
  const suffix = row.toString(16).padStart(12, '0');
  return `${prefix}-0000-4000-8000-${suffix}`;
}

const churchId = (i: number) => id(1, i);
const departmentId = (i: number) => id(2, i);
const userId = (i: number) => id(3, i);
const inviteId = (i: number) => id(4, i);
const sessionId = (i: number) => id(5, i);
const memberId = (i: number) => id(6, i);
const meetingId = (i: number) => id(7, i);
const careNoteId = (i: number) => id(8, i);
const fundId = (i: number) => id(9, i);
const donationId = (i: number) => id(10, i);
const serviceTypeId = (i: number) => id(11, i);

const rows = Array.from({ length: COUNT }, (_, i) => i + 1);

/** `days` ago, at a fixed time of day so runs are reproducible. */
function daysAgo(days: number): Date {
  const date = new Date('2026-08-01T09:00:00.000Z');
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

const CHURCH_NAMES = [
  'Grace Chapel',
  'Cornerstone Assembly',
  'Living Waters Cathedral',
  'Redeemed Hope Centre',
  'Mount Zion Fellowship',
  'City Light Church',
  'Faith Harvest Chapel',
  'New Covenant Assembly',
  'Rock of Ages Cathedral',
  'Open Heavens Fellowship',
];

const DEPARTMENT_NAMES = [
  'Choir',
  'Ushering',
  'Media',
  'Children',
  'Youth',
  'Prayer',
  'Welfare',
  'Evangelism',
  'Protocol',
  'Sanctuary Keeping',
];

const PEOPLE = [
  ['Ama', 'Boateng'],
  ['Kwame', 'Mensah'],
  ['Chidi', 'Okafor'],
  ['Naana', 'Asante'],
  ['Tunde', 'Adeyemi'],
  ['Efua', 'Darko'],
  ['Ifeoma', 'Nwosu'],
  ['Kojo', 'Owusu'],
  ['Zainab', 'Bello'],
  ['Yaw', 'Ofori'],
];

const USER_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.DEPARTMENT_LEADER,
  UserRole.MEMBER_CARE,
  UserRole.VIEWER,
];

const FUND_NAMES = [
  'Tithe',
  'General Offering',
  'Building Fund',
  'Missions',
  'Welfare',
  'Youth Camp',
  'Media Equipment',
  'Benevolence',
  'Church Van',
  'Thanksgiving',
];

const MEETING_TITLES = [
  'Sunday First Service',
  'Sunday Second Service',
  'Midweek Bible Study',
  'Prayer Vigil',
  'Youth Service',
  'Communion Service',
  'Workers Meeting',
  'Thanksgiving Service',
  'Evening Revival',
  'Sunday School',
];

const SERVICE_TYPE_NAMES = [
  'Sunday Service',
  'Second Service',
  'Bible Study',
  'Prayer Vigil',
  'Youth Service',
  'Communion Service',
  'Workers Meeting',
  'Thanksgiving Service',
  'Revival',
  'Sunday School',
];

const CARE_TYPES: CareType[] = [
  CareType.VISIT,
  CareType.CALL,
  CareType.PRAYER,
  CareType.COUNSEL,
  CareType.FOLLOW_UP,
];

const GIVING_METHODS: GivingMethod[] = [
  GivingMethod.CASH,
  GivingMethod.TRANSFER,
  GivingMethod.CARD,
  GivingMethod.MOBILE_MONEY,
];

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  const home = churchId(1);

  await prisma.church.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: churchId(i),
      name: CHURCH_NAMES[i - 1],
      slug: CHURCH_NAMES[i - 1].toLowerCase().replace(/[^a-z]+/g, '-'),
      address: `${i * 12} Independence Road, Accra`,
      phone: `+2332000000${String(i).padStart(2, '0')}`,
      email: `hello@${CHURCH_NAMES[i - 1].toLowerCase().replace(/[^a-z]+/g, '')}.org`,
      isActive: i !== COUNT, // one paused tenant, so the status filter has something to show
      defaultCurrency: i % 2 === 0 ? 'GHS' : 'NGN',
    })),
  });

  await prisma.department.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: departmentId(i),
      churchId: home,
      name: DEPARTMENT_NAMES[i - 1],
      description: `The ${DEPARTMENT_NAMES[i - 1].toLowerCase()} team.`,
    })),
  });

  await prisma.user.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: userId(i),
      churchId: home,
      email: `demo${i}@gracechapel.org`,
      password,
      firstName: PEOPLE[i - 1][0],
      lastName: PEOPLE[i - 1][1],
      role: USER_ROLES[(i - 1) % USER_ROLES.length],
      status: i > COUNT - 2 ? UserStatus.PENDING : UserStatus.ACTIVE,
      mustChangePassword: false,
    })),
  });

  await prisma.userInvite.createMany({
    skipDuplicates: true,
    data: rows.map((i) => {
      const token = `demo-invite-token-${i}`;
      return {
        id: inviteId(i),
        churchId: home,
        email: `invitee${i}@gracechapel.org`,
        role: USER_ROLES[(i - 1) % USER_ROLES.length],
        token,
        tokenHash: createHash('sha256').update(token).digest('hex'),
        // Two already expired, two accepted, the rest pending.
        expiresAt: i <= 2 ? daysAgo(3) : daysAgo(-3),
        used: i === 3 || i === 4,
        createdAt: daysAgo(5 + i),
      };
    }),
  });

  await prisma.session.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: sessionId(i),
      userId: userId(i),
      refreshTokenHash: createHash('sha256')
        .update(`demo-refresh-${i}`)
        .digest('hex'),
      userAgent: i % 2 === 0 ? 'Chrome on macOS' : 'Safari on iOS',
      ip: `197.255.0.${i}`,
      createdAt: daysAgo(i),
      lastSeenAt: daysAgo(i - 1 < 0 ? 0 : i - 1),
      revokedAt: i === COUNT ? daysAgo(1) : null, // one signed-out device
    })),
  });

  await prisma.member.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: memberId(i),
      churchId: home,
      // The first three members are also staff accounts; the rest have no login.
      userId: i <= 3 ? userId(i) : null,
      firstName: PEOPLE[i - 1][0],
      lastName: PEOPLE[i - 1][1],
      phone: `+2335500000${String(i).padStart(2, '0')}`,
      status:
        i > COUNT - 2
          ? MemberStatus.VISITOR
          : i === COUNT - 2
            ? MemberStatus.INACTIVE
            : MemberStatus.ACTIVE,
      joinDate: daysAgo(30 * i),
    })),
  });

  // Membership form details. Applied with updateMany so a re-run fills rows
  // seeded before these columns existed without clobbering hand-edited ones.
  const TOWNS = [
    'Accra',
    'Kumasi',
    'Takoradi',
    'Cape Coast',
    'Tamale',
    'Ho',
    'Koforidua',
    'Sunyani',
    'Wa',
    'Bolgatanga',
  ];
  const OCCUPATIONS = [
    'Teacher',
    'Trader',
    'Nurse',
    'Accountant',
    'Driver',
    'Seamstress',
    'Engineer',
    'Farmer',
    'Banker',
    'Student',
  ];
  const SOCIETIES = ["Men's Fellowship", "Women's Fellowship", 'Youth Fellowship'];
  const MARITAL: MaritalStatus[] = [
    MaritalStatus.SINGLE,
    MaritalStatus.MARRIED,
    MaritalStatus.WIDOWED,
    MaritalStatus.DIVORCED,
  ];

  await prisma.$transaction(
    rows.map((i) => {
      const [firstName, lastName] = PEOPLE[i - 1];
      const spouse = PEOPLE[i % COUNT];
      const maritalStatus = MARITAL[(i - 1) % MARITAL.length];
      const married = maritalStatus === MaritalStatus.MARRIED;
      return prisma.member.updateMany({
        where: { id: memberId(i), sex: null },
        data: {
          sex: i % 2 === 0 ? Sex.MALE : Sex.FEMALE,
          dateOfBirth: daysAgo(365 * 22 + i * 400),
          placeOfBirth: TOWNS[i - 1],
          address: `P.O. Box ${100 + i}, ${TOWNS[i - 1]}`,
          placeOfResidence: TOWNS[(i + 3) % COUNT],
          occupation: OCCUPATIONS[i - 1],
          placeOfWork: `${TOWNS[i - 1]} ${OCCUPATIONS[i - 1]}s Ltd`,
          society: SOCIETIES[(i - 1) % SOCIETIES.length],
          nextOfKin: `${spouse[0]} ${spouse[1]}`,
          parentsName: `Mr. & Mrs. ${lastName}`,
          hometown: TOWNS[(i + 5) % COUNT],
          maritalStatus,
          spouseName: married ? `${spouse[0]} ${spouse[1]}` : null,
          spouseOccupation: married ? OCCUPATIONS[(i + 2) % COUNT] : null,
          religiousDenomination: 'Methodist',
          childrenNames: married ? [`${firstName} Jnr`, `Adwoa ${lastName}`] : [],
          declarationDate: daysAgo(30 * i),
        },
      });
    }),
  );

  await prisma.memberDepartment.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      memberId: memberId(i),
      departmentId: departmentId(i),
      role: i <= 2 ? DepartmentRole.LEADER : DepartmentRole.MEMBER,
    })),
  });

  await prisma.serviceType.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: serviceTypeId(i),
      churchId: home,
      name: SERVICE_TYPE_NAMES[i - 1],
      isActive: i !== COUNT, // one retired type, so the filter has something to hide
    })),
  });

  await prisma.attendanceSession.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: meetingId(i),
      churchId: home,
      title: MEETING_TITLES[i - 1],
      serviceTypeId: serviceTypeId(i),
      date: daysAgo(i * 7),
      status:
        i <= 6
          ? AttendanceStatus.REVIEWED
          : i <= 8
            ? AttendanceStatus.SUBMITTED
            : AttendanceStatus.DRAFT,
      recordedById: userId(1),
      reviewedById: i <= 6 ? userId(2) : null,
      reviewedAt: i <= 6 ? daysAgo(i * 7 - 1) : null,
    })),
  });

  // Sessions seeded before service types existed were skipped as duplicates
  // above, so link them here — otherwise demo rolls show a blank type forever.
  // Resolved by name, not by seeded id: a hand-created type of the same name
  // wins the unique constraint, and the demo row is the one that got skipped.
  const typeIdByName = new Map(
    (await prisma.serviceType.findMany({ where: { churchId: home } })).map(
      (t) => [t.name, t.id],
    ),
  );
  await prisma.$transaction(
    rows
      .filter((i) => typeIdByName.has(SERVICE_TYPE_NAMES[i - 1]))
      .map((i) =>
        prisma.attendanceSession.updateMany({
          where: { id: meetingId(i), serviceTypeId: null },
          data: { serviceTypeId: typeIdByName.get(SERVICE_TYPE_NAMES[i - 1])! },
        }),
      ),
  );

  await prisma.attendance.createMany({
    skipDuplicates: true,
    // One present-mark per meeting, walking the member list so both sides vary.
    data: rows.map((i) => ({
      sessionId: meetingId(i),
      memberId: memberId(i),
      markedAt: daysAgo(i * 7),
    })),
  });

  await prisma.careNote.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: careNoteId(i),
      churchId: home,
      memberId: memberId(i),
      authorId: userId(4), // the member-care account
      type: CARE_TYPES[(i - 1) % CARE_TYPES.length],
      body: `Follow-up ${i}: spoke with ${PEOPLE[i - 1][0]} about settling into the church.`,
      confidential: i % 5 === 0,
      // Two overdue, two resolved, the rest scheduled ahead.
      followUpAt: i <= 4 ? daysAgo(i) : daysAgo(-i),
      resolvedAt: i === 3 || i === 4 ? daysAgo(1) : null,
      createdAt: daysAgo(i * 2),
    })),
  });

  await prisma.fund.createMany({
    skipDuplicates: true,
    data: rows.map((i) => ({
      id: fundId(i),
      churchId: home,
      name: FUND_NAMES[i - 1],
      isActive: i !== COUNT,
    })),
  });

  await prisma.donation.createMany({
    skipDuplicates: true,
    data: rows.map((i) => {
      // The last row is a correction of the first: negated amount, same fund.
      const isReversal = i === COUNT;
      return {
        id: donationId(i),
        churchId: home,
        memberId: i % 4 === 0 ? null : memberId(i), // some anonymous giving
        fundId: isReversal ? fundId(1) : fundId(i),
        amountMinor: isReversal ? -250_000 : i * 250_000,
        currency: 'NGN',
        method: GIVING_METHODS[(i - 1) % GIVING_METHODS.length],
        reference: `REF-${String(i).padStart(4, '0')}`,
        note: isReversal ? 'Duplicate entry corrected' : null,
        reversesId: isReversal ? donationId(1) : null,
        recordedById: userId(2), // the finance account
        givenAt: daysAgo(i * 3),
      };
    }),
  });

  const counts = {
    churches: await prisma.church.count(),
    departments: await prisma.department.count(),
    users: await prisma.user.count(),
    invites: await prisma.userInvite.count(),
    loginSessions: await prisma.session.count(),
    members: await prisma.member.count(),
    memberDepartments: await prisma.memberDepartment.count(),
    serviceTypes: await prisma.serviceType.count(),
    attendanceSessions: await prisma.attendanceSession.count(),
    attendance: await prisma.attendance.count(),
    careNotes: await prisma.careNote.count(),
    funds: await prisma.fund.count(),
    donations: await prisma.donation.count(),
  };

  console.table(counts);
  console.log(`Demo accounts: demo1..demo${COUNT}@gracechapel.org / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
