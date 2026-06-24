
/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

const bridges = [
  { name: 'Padma Bridge', nameBn: 'পদ্মা সেতু', district: 'Munshiganj', category: 'EXPRESSWAY', latitude: 23.4463, longitude: 90.2622 },
  { name: 'Bangabandhu Bridge', nameBn: 'বঙ্গবন্ধু সেতু', district: 'Sirajganj', category: 'NATIONAL', latitude: 24.0667, longitude: 89.7167 },
  { name: 'Meghna Bridge', nameBn: 'মেঘনা সেতু', district: 'Munshiganj', category: 'NATIONAL', latitude: 23.5897, longitude: 90.6036 },
  { name: 'Kanchpur Bridge', nameBn: 'কাঁচপুর সেতু', district: 'Narayanganj', category: 'NATIONAL', latitude: 23.7186, longitude: 90.5875 },
  { name: 'Lalon Shah Bridge', nameBn: 'লালন শাহ সেতু', district: 'Kushtia', category: 'NATIONAL', latitude: 23.9093, longitude: 89.1152 },
  { name: 'Bhairab Bridge', nameBn: 'ভৈরব সেতু', district: 'Kishoreganj', category: 'NATIONAL', latitude: 24.0547, longitude: 90.9728 },
  { name: 'Muktarpur Bridge', nameBn: 'মুক্তারপুর সেতু', district: 'Munshiganj', category: 'NATIONAL', latitude: 23.5133, longitude: 90.5488 },
  { name: 'Gomti Bridge', nameBn: 'গোমতী সেতু', district: 'Comilla', category: 'LOCAL', latitude: 23.4607, longitude: 91.1991 },
  { name: 'Sultan Mahmud Bridge', nameBn: 'সুলতান মাহমুদ সেতু', district: 'Khulna', category: 'LOCAL', latitude: 22.8456, longitude: 89.5403 },
  { name: 'Second Meghna Bridge', nameBn: 'দ্বিতীয় মেঘনা সেতু', district: 'Munshiganj', category: 'NATIONAL', latitude: 23.575, longitude: 90.61 }
] as const;

const getRates = (name: string) => {
  if (name === 'Padma Bridge') {
    return { rateA: 20000, rateB: 150000, rateC: 240000, rateD: 380000, rateE: 320000, rateF: 560000 };
  }

  if (name === 'Bangabandhu Bridge') {
    return { rateA: 5000, rateB: 40000, rateC: 60000, rateD: 100000, rateE: 80000, rateF: 150000 };
  }

  return { rateA: 10000, rateB: 75000, rateC: 120000, rateD: 200000, rateE: 160000, rateF: 280000 };
};

const main = async () => {
  const passwordHash = await hashPassword('Admin@1234');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tollbd.com.bd' },
    update: {
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true
    },
    create: {
      email: 'admin@tollbd.com.bd',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      fullName: 'TollBD Admin',
      emailVerified: true,
      wallet: { create: { balance: 0 } }
    }
  });

  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 0 }
  });

  for (const bridge of bridges) {
    const existingBridge = await prisma.bridge.findFirst({ where: { name: bridge.name } });
    const bridgeData = {
      nameBn: bridge.nameBn,
      district: bridge.district,
      location: `${bridge.district}, Bangladesh`,
      latitude: bridge.latitude,
      longitude: bridge.longitude,
      category: bridge.category,
      authorityName: 'Bangladesh Bridge Authority',
      hasFastpass: true,
      status: 'ACTIVE'
    } as const;
    const created = existingBridge
      ? await prisma.bridge.update({ where: { id: existingBridge.id }, data: bridgeData })
      : await prisma.bridge.create({
          data: {
            name: bridge.name,
            ...bridgeData
          }
        });

    await prisma.tollRate.upsert({
      where: { bridgeId: created.id },
      update: { ...getRates(bridge.name), updatedById: admin.id },
      create: { bridgeId: created.id, ...getRates(bridge.name), updatedById: admin.id }
    });
  }

  const announcements = [
    {
      title: 'Welcome to TollBD',
      titleBn: 'টোলবিডিতে স্বাগতম',
      body: 'Smart toll payment is now available.',
      bodyBn: 'স্মার্ট টোল পেমেন্ট এখন চালু।',
      type: 'INFO'
    },
    {
      title: 'Keep vehicles verified',
      titleBn: 'যানবাহন যাচাই রাখুন',
      body: 'Only verified vehicles can use fast toll payment.',
      bodyBn: 'শুধু যাচাইকৃত যানবাহন দ্রুত টোল পেমেন্ট ব্যবহার করতে পারবে।',
      type: 'WARNING'
    },
    {
      title: 'Maintenance notices',
      titleBn: 'রক্ষণাবেক্ষণ নোটিশ',
      body: 'Bridge maintenance updates will appear here.',
      bodyBn: 'সেতু রক্ষণাবেক্ষণের আপডেট এখানে দেখানো হবে।',
      type: 'MAINTENANCE'
    }
  ] as const;

  for (const item of announcements) {
    await prisma.announcement.create({
      data: {
        ...item,
        createdById: admin.id,
        targetBridgeIds: [],
        isActive: true
      }
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
