// scripts/migrate-lgpd-consent.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from '../src/models/artistModel.js';

dotenv.config();

const migrateLGPDConsent = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os artistas sem consentimento LGPD
    const artistsWithoutConsent = await Artist.find({
      'lgpdConsent.accepted': { $ne: true }
    });

    console.log(`📊 Encontrados ${artistsWithoutConsent.length} artistas sem consentimento LGPD`);

    if (artistsWithoutConsent.length === 0) {
      console.log('✅ Todos os artistas já têm consentimento registrado');
      process.exit(0);
    }

    // Atualizar cada artista
    for (const artist of artistsWithoutConsent) {
      await Artist.findByIdAndUpdate(artist._id, {
        $set: {
          'lgpdConsent.accepted': true,
          'lgpdConsent.acceptedAt': new Date(),
          'lgpdConsent.version': '1.0',
          'lgpdConsent.retroactive': true,
          'lgpdConsent.ipAddress': 'migration-script'
        }
      });
      console.log(`✅ Consentimento adicionado para: ${artist.name}`);
    }

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log(`📧 Próximo passo: Enviar e-mail informativo para ${artistsWithoutConsent.length} artistas`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
};

migrateLGPDConsent();