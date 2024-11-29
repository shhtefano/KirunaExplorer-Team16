// Importa la libreria di Supabase usando import
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';  // Per leggere il file dal filesystem

// Configura Supabase con le tue credenziali
const supabaseUrl = 'https://htbtahvbjarpdpzgzxug.supabase.co'; // URL del progetto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YnRhaHZiamFycGRwemd6eHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MTM0MDUsImV4cCI6MjA0ODQ4OTQwNX0.Vnj0lJX4pd-cplV1m3K6sVBqTkPOkQgWNrPmnrh1VLE'; // La chiave anonima
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadFile = async (filePath, fileName) => {
  try {
    // Leggi il file dal percorso locale
    const file = fs.readFileSync(filePath);

    // Carica il file su Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('resources')  // Nome del tuo bucket
      .upload(`uploads/images/${fileName}`, file, {
        contentType: 'image/jpeg'  // Tipo di contenuto
      });

    if (error) {
      console.error('Errore durante l’upload:', error.message);
      return;
    }

    // Se il caricamento è riuscito, genera l'URL del file
    const fileUrl = `https://htbtahvbjarpdpzgzxug.supabase.co/storage/v1/object/public/resources/${fileName}`;
    console.log('File caricato con successo. URL:', fileUrl);

  } catch (error) {
    console.error('Errore durante l’operazione:', error.message);
  }
};

// Esegui l'upload del file
uploadFile('./z.jpg', 'z.jpg');  // 'x.jpg' è il nome del file che stai caricando
