//paso 1 declaramos las constantes con los modulos que necesitamos
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

/*
paso 2 el API de NVIDIA para whisper-large-v3 NO es REST, es gRPC (Riva).
Por eso no existe una URL para usar con fetch: nos conectamos a un servidor gRPC
y le indicamos que funcion queremos usar con el function-id
(https://build.nvidia.com/openai/whisper-large-v3/api)
*/
const NVIDIA_SERVER = 'grpc.nvcf.nvidia.com:443';
const WHISPER_FUNCTION_ID = 'b702f636-f60c-4a3d-a6f4-f3568c13bd7d';

//paso 3 cargamos la definicion del servicio de reconocimiento de voz desde los archivos .proto
const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, 'proto', 'riva', 'proto', 'riva_asr.proto'),
    { keepCase: true, longs: String, enums: String, defaults: true, includeDirs: [path.join(__dirname, 'proto')] }
);
const rasr = grpc.loadPackageDefinition(packageDefinition).nvidia.riva.asr;

/*
paso 4 el servicio solo acepta audio WAV/FLAC/OPUS (mono, 16 bits), asi que si el archivo
es otro formato (por ejemplo mp3) lo convertimos a WAV a 16 kHz usando afconvert (macOS)
o ffmpeg
*/
function convertirAWav(audioFilePath) {
    if (path.extname(audioFilePath).toLowerCase() === '.wav') {
        return audioFilePath;
    }
    const wavPath = path.join(os.tmpdir(), `${path.basename(audioFilePath, path.extname(audioFilePath))}_16k.wav`);
    try {
        execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@16000', '-c', '1', audioFilePath, wavPath]);
    } catch (error) {
        execFileSync('ffmpeg', ['-y', '-i', audioFilePath, '-ar', '16000', '-ac', '1', wavPath]);
    }
    return wavPath;
}

/*
paso 5 declaramos e implementamos la funcion a la cual le pasaremos el audio y el api key
de NVIDIA como parametro para transcribir nuestro audio
*/
async function transcribirAudio(audioFilePath, apiKey, languageCode = 'en-US') {
    try {
        //paso 6: validamos que el archivo de audio existe
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('El archivo no existe');
        }
        if (!apiKey) {
            throw new Error('Falta la variable de entorno NVIDIA_API_KEY');
        }

        //paso 7: convertimos (si hace falta) y leemos el archivo de audio
        const audioFile = fs.readFileSync(convertirAWav(audioFilePath));

        //paso 8: creamos el cliente seguro (TLS) y los metadatos de autenticacion
        const client = new rasr.RivaSpeechRecognition(NVIDIA_SERVER, grpc.credentials.createSsl());
        const metadata = new grpc.Metadata();
        metadata.add('function-id', WHISPER_FUNCTION_ID);
        metadata.add('authorization', `Bearer ${apiKey}`);

        //paso 9: armamos la solicitud con la configuracion y el contenido del audio
        const request = {
            config: {
                encoding: 'ENCODING_UNSPECIFIED', // el encabezado del WAV indica el formato
                sample_rate_hertz: 16000,
                language_code: languageCode,
                max_alternatives: 1,
                enable_automatic_punctuation: true
            },
            audio: audioFile
        };

        //paso 10: realizamos la solicitud al servidor de NVIDIA
        const response = await new Promise((resolve, reject) => {
            client.Recognize(request, metadata, (error, res) => (error ? reject(error) : resolve(res)));
        });

        //paso 11: unimos los fragmentos transcritos en un solo texto
        const transcription = response.results
            .map(result => result.alternatives[0].transcript.trim())
            .join(' ');

        //paso 12: guardamos la transcripcion junto al audio, con ruta independiente del sistema operativo
        const outputFilePath = path.join(path.dirname(audioFilePath),
            `${path.basename(audioFilePath, path.extname(audioFilePath))}_transcription.txt`);
        fs.writeFileSync(outputFilePath, transcription);
        console.log(`Transcripcion guardada en: ${outputFilePath}`);
        return transcription;
    } catch (error) {
        //paso 13: manejamos el error
        console.error('Error durante la transcripcion', error.message);
        throw error;
    }
}

//paso 14: ruta del audio relativa a este archivo, para que funcione desde cualquier carpeta
const audioPath = path.join(__dirname, 'audio', 'audio.mp3');

//paso 15: la API key se lee de la variable de entorno NVIDIA_API_KEY, nunca se escribe en el codigo.
//Si existe el archivo .env en la raiz del proyecto lo cargamos para no tener que exportarla a mano
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
    // no hay archivo .env, usamos las variables de entorno que ya existan
}
const nvidiaApiKey = process.env.NVIDIA_API_KEY;

//paso 16: llamamos a la funcion y manejamos el resultado
transcribirAudio(audioPath, nvidiaApiKey, process.env.LANGUAGE_CODE || 'en-US')
    .then(transcription => {
        console.log('Transcripción generada con exito');
        console.log(transcription);
    })
    .catch(error => {
        console.error('Fallo la transcripción', error);
    });
