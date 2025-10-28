import api from '../provider/api';

/**
 * Serviço para gerenciar upload e download de arquivos (fotos)
 * Integração com FileController do backend (POST /files, GET /files/download/{id})
 */

/**
 * Converte string Base64 para Blob
 * @param {string} base64String - String Base64 com ou sem prefixo data:image/...
 * @returns {Object} { blob: Blob, mimeType: string }
 */
function base64ToBlob(base64String) {
  try {
    // Extrair mime type e dados
    const parts = base64String.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = parts.length > 1 ? parts[1] : parts[0];
    
    // Decodificar Base64 para bytes
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const blob = new Blob([byteNumbers], { type: mimeType });
    
    return { blob, mimeType };
  } catch (error) {
    console.error('❌ Erro ao converter Base64 para Blob:', error);
    throw new Error('Falha ao processar imagem');
  }
}

/**
 * Faz upload de uma foto para o backend
 * @param {string} base64String - String Base64 da foto (data:image/jpeg;base64,...)
 * @param {string} nomeArquivo - Nome do arquivo (padrão: foto_beneficiado.jpg)
 * @returns {Promise<number>} ID da foto cadastrada no backend
 */
export async function uploadFoto(base64String, nomeArquivo = 'foto_beneficiado.jpg') {
  try {
    console.log('📤 Iniciando upload de foto...');
    console.log('   Tamanho Base64:', base64String.length, 'caracteres');
    
    // Converter Base64 para Blob
    const { blob, mimeType } = base64ToBlob(base64String);
    console.log('   Tipo MIME:', mimeType);
    console.log('   Tamanho Blob:', blob.size, 'bytes');
    
    // Criar FormData (multipart/form-data)
    const formData = new FormData();
    formData.append('file', blob, nomeArquivo);
    
    // Fazer upload
    // IMPORTANTE: NÃO passar objeto headers - deixar o axios definir automaticamente o Content-Type com boundary
    const response = await api.post('/files', formData);
    
    console.log('✅ Upload concluído com sucesso!');
    console.log('   ID da foto:', response.data.id);
    console.log('   Nome original:', response.data.nomeOriginal);
    console.log('   Nome armazenamento:', response.data.nomeArmazenamento);
    console.log('   Tamanho:', response.data.tamanho, 'bytes');
    console.log('   Formato:', response.data.formato);
    
    return response.data.id;
    
  } catch (error) {
    console.error('❌ Erro no upload da foto:', error);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
      
      if (error.response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      } else if (error.response.status === 413) {
        throw new Error('Imagem muito grande. Tamanho máximo: 800KB (arquivo original)');
      } else if (error.response.status === 415) {
        throw new Error('Formato de imagem não suportado. Use JPG, PNG ou GIF.');
      } else {
        throw new Error(`Erro no upload: ${error.response.data.message || error.response.statusText}`);
      }
    } else if (error.request) {
      console.error('   Sem resposta do servidor');
      throw new Error('Servidor indisponível. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro ao fazer upload da foto');
    }
  }
}

/**
 * Obtém a URL para download de uma foto
 * @param {number} fotoId - ID da foto no backend
 * @returns {string} URL completa para exibir a foto
 */
export function getFotoUrl(fotoId) {
  if (!fotoId) {
    return null;
  }
  
  // URL do endpoint de download: GET /files/download/{id}
  const baseURL = api.defaults.baseURL || 'http://localhost:8080';
  return `${baseURL}/files/download/${fotoId}`;
}

/**
 * Baixa uma foto do backend
 * @param {number} fotoId - ID da foto
 * @returns {Promise<Blob>} Blob da imagem
 */
export async function downloadFoto(fotoId) {
  try {
    console.log(`📥 Baixando foto ID: ${fotoId}...`);
    
    const response = await api.get(`/files/download/${fotoId}`, {
      responseType: 'blob'
    });
    
    console.log('✅ Download concluído!');
    console.log('   Content-Type:', response.headers['content-type']);
    console.log('   Tamanho:', response.data.size, 'bytes');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro ao baixar foto:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Foto não encontrada');
    } else {
      throw new Error('Erro ao carregar foto');
    }
  }
}

/**
 * Busca uma foto autenticada e retorna um Blob URL para exibição
 * @param {number} fotoId - ID da foto
 * @returns {Promise<string>} URL do blob para usar em <img src={...} />
 */
export async function getFotoBlobUrl(fotoId) {
  try {
    const blob = await downloadFoto(fotoId);
    const blobUrl = URL.createObjectURL(blob);
    console.log('✅ Blob URL criada para foto ID:', fotoId);
    return blobUrl;
  } catch (error) {
    console.error('❌ Erro ao criar Blob URL:', error);
    throw error;
  }
}

/**
 * Deleta uma foto do backend
 * @param {number} fotoId - ID da foto
 * @returns {Promise<void>}
 */
export async function deletarFoto(fotoId) {
  try {
    console.log(`🗑️ Deletando foto ID: ${fotoId}...`);
    
    await api.delete(`/files/${fotoId}`);
    
    console.log('✅ Foto deletada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao deletar foto:', error);
    throw new Error('Erro ao deletar foto');
  }
}

const fileService = {
  uploadFoto,
  getFotoUrl,
  downloadFoto,
  getFotoBlobUrl,
  deletarFoto
};

export default fileService;
