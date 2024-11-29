// Importa la libreria di Supabase usando import
import { createClient } from '@supabase/supabase-js';

// Configura Supabase con le tue credenziali
const supabaseUrl = 'https://htbtahvbjarpdpzgzxug.supabase.co'; // URL del progetto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YnRhaHZiamFycGRwemd6eHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MTM0MDUsImV4cCI6MjA0ODQ4OTQwNX0.Vnj0lJX4pd-cplV1m3K6sVBqTkPOkQgWNrPmnrh1VLE'; // La chiave anonima
const supabase = createClient(supabaseUrl, supabaseKey);

// Funzione per caricare un file su Supabase
const uploadFileToSupabase = async (file) => {
  const fileName = `uploads/resources/${file.name}`; // Path del file nel bucket
  
  // Usa Supabase Storage per caricare il file
  const { data, error } = await supabase.storage
    .from('resources') // Nome del bucket
    .upload(fileName, file, {
      contentType: file.type, // Usa il MIME type del file
    });

  if (error) {
    throw new Error(error.message);
  }

  // URL pubblico del file
  const fileUrl = `${supabaseUrl}/storage/v1/object/public/resources/${fileName}`;
  return fileUrl;
};

