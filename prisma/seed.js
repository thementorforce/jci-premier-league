const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.bidHistory.deleteMany({});
  await prisma.playerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.adPlacement.deleteMany({});

  // 1. Create Teams
  const teams = [
    { name: 'Tumkur Titans', ownerName: 'Rajesh Gowda', pointsPurse: 100000, pointsSpent: 0 },
    { name: 'Metro Mavericks', ownerName: 'Amit Shah', pointsPurse: 100000, pointsSpent: 0 },
    { name: 'Prerana Panthers', ownerName: 'Dr. Ramesh', pointsPurse: 100000, pointsSpent: 0 },
    { name: 'JCI Warriors', ownerName: 'Kiran Kumar', pointsPurse: 100000, pointsSpent: 0 },
    { name: 'Royal Challengers Tumkur', ownerName: 'Sanjay Murthy', pointsPurse: 100000, pointsSpent: 0 },
  ];

  const seededTeams = [];
  for (const t of teams) {
    const team = await prisma.team.create({ data: t });
    seededTeams.push(team);
  }
  console.log(`Seeded ${seededTeams.length} teams.`);

  // 2. Create Users (Owners & Admin)
  // Admin user
  await prisma.user.create({
    data: {
      username: 'admin',
      password: 'adminpassword', // In production, hash this!
      role: 'ADMIN',
    },
  });

  // Owner users
  for (let i = 0; i < seededTeams.length; i++) {
    const team = seededTeams[i];
    const username = `owner_${team.name.toLowerCase().replace(/\s+/g, '_')}`;
    await prisma.user.create({
      data: {
        username,
        password: 'password123',
        role: 'OWNER',
        teamId: team.id,
      },
    });
  }
  console.log('Seeded users (admin and owners).');

  // 3. Create Sample Players
  const players = [
    {
      fullName: 'Anil Kumar',
      mobileNumber: '9876543210',
      organization: 'JCI Tumkur Metro',
      gender: 'Male',
      ageGroup: '25–40 Years',
      jerseySize: 'L',
      preferredRole: 'All-Rounder',
      experience: 'Experienced',
      status: 'Registered',
    },
    {
      fullName: 'Sunil Prasad',
      mobileNumber: '9876543211',
      organization: 'JCOM',
      gender: 'Male',
      ageGroup: 'Below 25 Years',
      jerseySize: 'M',
      preferredRole: 'Batsman',
      experience: 'Experienced',
      status: 'Registered',
    },
    {
      fullName: 'Rahul M',
      mobileNumber: '9876543212',
      organization: 'JAC',
      gender: 'Male',
      ageGroup: '25–40 Years',
      jerseySize: 'XL',
      preferredRole: 'Bowler',
      experience: 'Intermediate',
      status: 'Registered',
    },
    {
      fullName: 'Sneha Gowda',
      mobileNumber: '9876543213',
      organization: 'Rotary Tumkur Prerana',
      gender: 'Female',
      ageGroup: 'Below 25 Years',
      jerseySize: 'S',
      preferredRole: 'Wicketkeeper',
      experience: 'Intermediate',
      status: 'Registered',
    },
    {
      fullName: 'Vijay R',
      mobileNumber: '9876543214',
      organization: 'JCI Tumkur Metro',
      gender: 'Male',
      ageGroup: 'Above 40 Years',
      jerseySize: 'XXL',
      preferredRole: 'Batsman',
      experience: 'Beginner',
      status: 'Registered',
    },
  ];

  for (const p of players) {
    await prisma.playerProfile.create({ data: p });
  }
  console.log(`Seeded ${players.length} players.`);

  // 4. Create Sample Ads
  const ads = [
    {
      title: 'Decathlon Sports Tumkur',
      imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
      targetUrl: 'https://www.decathlon.in',
      position: 'TOP_BANNER',
    },
    {
      title: 'Tumkur Premium Sports Shop',
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80',
      targetUrl: '#',
      position: 'SIDEBAR',
    },
  ];

  for (const ad of ads) {
    await prisma.adPlacement.create({ data: ad });
  }
  console.log(`Seeded ${ads.length} ads.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
