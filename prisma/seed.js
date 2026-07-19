const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Avoid wiping database in production!
  if (process.env.NODE_ENV === 'production') {
    console.log('Production detected. Skipping clean step, only checking for missing data.');
    
    // Seed default admin if missing
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminExists) {
      await prisma.user.create({
        data: {
          username: 'admin',
          password: 'adminpassword',
          role: 'ADMIN',
        },
      });
      console.log('Seeded default admin user in production.');
    }
    
    // Seed teams if missing
    const teamCount = await prisma.team.count();
    if (teamCount === 0) {
      const defaultTeams = [
        { name: 'Tumkur Titans', ownerName: 'Rajesh Gowda', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'Metro Mavericks', ownerName: 'Amit Shah', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'Prerana Panthers', ownerName: 'Dr. Ramesh', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'JCI Warriors', ownerName: 'Kiran Kumar', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'Royal Challengers Tumkur', ownerName: 'Sanjay Murthy', pointsPurse: 100000, pointsSpent: 0 },
      ];
      
      const seededTeams = [];
      for (const t of defaultTeams) {
        const team = await prisma.team.create({ data: t });
        seededTeams.push(team);
      }
      console.log('Seeded default teams in production.');
      
      // Also seed owner users for these teams
      for (const team of seededTeams) {
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
      console.log('Seeded owner users in production.');
    }
    
    console.log('Production seed completed successfully!');
    return;
  }

  // Clean existing data (only run in local development)
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
      email: 'anil.kumar@example.com',
      mobileNumber: '9876543210',
      organization: 'JCI Tumkur Metro',
      gender: 'Male',
      ageGroup: '25–40 Years',
      jerseySize: 'L',
      preferredRole: 'All-Rounder',
      experience: 'Experienced',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      status: 'Registered',
    },
    {
      fullName: 'Sunil Prasad',
      email: 'sunil.prasad@example.com',
      mobileNumber: '9876543211',
      organization: 'JCOM',
      gender: 'Male',
      ageGroup: 'Below 25 Years',
      jerseySize: 'M',
      preferredRole: 'Batsman',
      experience: 'Experienced',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      status: 'Registered',
    },
    {
      fullName: 'Rahul M',
      email: 'rahul.m@example.com',
      mobileNumber: '9876543212',
      organization: 'JAC',
      gender: 'Male',
      ageGroup: '25–40 Years',
      jerseySize: 'XL',
      preferredRole: 'Bowler',
      experience: 'Intermediate',
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      status: 'Registered',
    },
    {
      fullName: 'Sneha Gowda',
      email: 'sneha.gowda@example.com',
      mobileNumber: '9876543213',
      organization: 'Rotary Tumkur Prerana',
      gender: 'Female',
      ageGroup: 'Below 25 Years',
      jerseySize: 'S',
      preferredRole: 'Wicketkeeper',
      experience: 'Intermediate',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      status: 'Registered',
    },
    {
      fullName: 'Vijay R',
      email: 'vijay.r@example.com',
      mobileNumber: '9876543214',
      organization: 'JCI Tumkur Metro',
      gender: 'Male',
      ageGroup: 'Above 40 Years',
      jerseySize: 'XXL',
      preferredRole: 'Batsman',
      experience: 'Beginner',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
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
      title: 'Tumkur Cricket Academy',
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
      targetUrl: '#',
      position: 'TOP_BANNER',
    },
    {
      title: 'JCI Tumkur Metro',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607be7e72?auto=format&fit=crop&w=800&q=80',
      targetUrl: '#',
      position: 'TOP_BANNER',
    },
    {
      title: 'Local Sports Partner',
      imageUrl: 'https://images.unsplash.com/photo-1624526267662-791473f29493?auto=format&fit=crop&w=800&q=80',
      targetUrl: '#',
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
