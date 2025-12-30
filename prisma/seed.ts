import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Supprimer l'ancien admin s'il existe
  await prisma.admin.deleteMany({
    where: { email: 'admin@clinic.com' }
  });

  // Créer le mot de passe hashé
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('📝 Mot de passe hashé:', hashedPassword);

  // Créer l'admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@clinic.com',
      password: hashedPassword,
      name: 'Admin Principal',
    },
  });

  console.log('✅ Admin créé avec succès:');
  console.log('   Email:', admin.email);
  console.log('   Nom:', admin.name);
  console.log('');
  console.log('🔑 Identifiants de connexion:');
  console.log('   Email: admin@clinic.com');
  console.log('   Mot de passe: admin123');
  console.log('');

  // Créer quelques visites de test
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  await prisma.visit.create({
    data: {
      queueNumber: 1,
      patientName: 'Ahmed Benali',
      patientPhone: '0555 12 34 56',
      status: 'WAITING',
      reason: 'Consultation de routine',
      createdAt: today,
    },
  });

  await prisma.visit.create({
    data: {
      queueNumber: 2,
      patientName: 'Fatima Zahra',
      patientPhone: '0666 78 90 12',
      status: 'WAITING',
      reason: 'Contrôle',
      createdAt: new Date(today.getTime() + 15 * 60000),
    },
  });

  console.log('✅ 2 visites de test créées');
  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
