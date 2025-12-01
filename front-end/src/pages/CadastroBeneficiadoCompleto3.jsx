import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Input from '../components/Input';
import Botao from '../components/Botao';
import '../styles/CadastroBeneficiadoCompleto3.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import iconeVoltar from '../assets/icone-voltar.png';
import { Download } from 'lucide-react';
import { beneficiadoService } from '../services/beneficiadoService';

export default function CadastroBeneficiadoCompleto3() {
  const [form, setForm] = useState({
    profissao: '',
    empresa: '',
    dependentes: '',
    renda: '',
    cargo: '',
    foto: null,
  });
  const [tipoUsuario, setTipoUsuario] = useState('2');
  const [modalSucesso, setModalSucesso] = useState({ open: false, mensagem: "" });
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalFotoGrande, setModalFotoGrande] = useState(false);
  const [modalFilhos, setModalFilhos] = useState(false);
  const [modalAuxilios, setModalAuxilios] = useState(false);
  const [modalTimeout, setModalTimeout] = useState(null);
  const [cadastrando, setCadastrando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tipo = sessionStorage.getItem('tipoUsuario') || '2';
    setTipoUsuario(tipo);
  }, []);

  // Auto-fechar modal de sucesso em 3 segundos
  useEffect(() => {
    if (modalSucesso.open) {
      const timeout = setTimeout(() => {
        setModalSucesso({ open: false, mensagem: '' });
        setModalFilhos(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [modalSucesso.open]);

  // Auto-fechar modal de erro em 3 segundos
  useEffect(() => {
    if (modalErro.open) {
      const timeout = setTimeout(() => {
        setModalErro({ open: false, mensagem: '' });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [modalErro.open]);

  const botoesNavbar = [
    { texto: 'Início', onClick: () => navigate('/home'), icone: iconeCasa },
    { texto: 'Perfil', onClick: () => navigate('/perfil'), icone: iconeUsuario },
    ...(tipoUsuario === '2' ? [{ texto: 'Fila de Espera', onClick: () => navigate('/fila-espera'), icone: iconeRelogio }] : []),
    { texto: 'Sair', onClick: () => navigate('/') , icone: iconeSair }
  ];
  const nomeUsuario = sessionStorage.getItem('nomeUsuario') || 'Usuário';

  function formatReais(value) {
    let numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    numbers = numbers.padStart(3, '0');
    let intValue = parseInt(numbers, 10);
    let formatted = (intValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return formatted;
  }

  // Função para converter data DD/MM/AAAA para YYYY-MM-DD
  function convertDateToISO(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Função para converter valor em reais para número
  function parseReais(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
  }

  // Função para converter arquivo para Base64
  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'foto') {
      const file = files[0];
      if (file) {
        // Validar tamanho da imagem
        // Backend tem limite de ~1MB para upload de foto
        // Como Base64 aumenta ~33%, limitamos arquivo original a 800KB
        const maxSize = 800 * 1024; // 800KB (seguro para virar ~1MB em Base64)
        const fileSizeInKB = (file.size / 1024).toFixed(0);
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        console.log('📸 Foto selecionada:', file.name);
        console.log('📏 Tamanho:', fileSizeInKB, 'KB (', fileSizeInMB, 'MB)');
        
        if (file.size > maxSize) {
          console.warn('⚠️ Imagem muito grande!', fileSizeInKB, 'KB (máximo: 800KB)');
          setModalFotoGrande(true);
          e.target.value = ''; // Limpar input
          return;
        }
        
        console.log('✅ Tamanho da imagem OK');
        setForm({ ...form, foto: file });
      }
    } else if (name === 'renda') {
      setForm({ ...form, renda: formatReais(value) });
    } else if (name === 'dependentes') {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      // Limitar a 2 caracteres
      const limitedValue = onlyNumbers.slice(0, 2);
      setForm({ ...form, [name]: limitedValue });
    } else {
      // Validação especial para campos que devem ter apenas letras e espaços simples
      const textOnlyFields = ["profissao", "cargo"];
      if (textOnlyFields.includes(name)) {
        // Remove números e caracteres especiais, mantém apenas letras e espaços
        let newValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        // Remove dois espaços seguidos
        newValue = newValue.replace(/\s{2,}/g, " ");
        setForm({ ...form, [name]: newValue });
      } else if (name === 'empresa') {
        // Campo empresa: não permite espaços duplos
        let newValue = value.replace(/\s{2,}/g, " ");
        setForm({ ...form, [name]: newValue });
      } else {
        setForm({ ...form, [name]: value });
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleCadastrarBeneficiado();
  }

  async function handleCadastrarBeneficiado() {
    setCadastrando(true);
    
    try {
      // Recuperar dados do sessionStorage das etapas anteriores
      const enderecoSelecionado = JSON.parse(sessionStorage.getItem("enderecoSelecionado") || '{}');
      
      // Dados do formulário atual das etapas anteriores (precisaria vir do CadastroBeneficiadoCompleto2)
      const dadosCompleto2 = JSON.parse(sessionStorage.getItem("dadosCompleto2") || '{}');

      // Validar se temos todos os dados necessários
      if (!enderecoSelecionado.id || !dadosCompleto2.nome) {
        setModalErro({ open: true, mensagem: 'Dados incompletos. Refaça o processo de cadastro.' });
        setCadastrando(false);
        return;
      }

      // ========================================
      // Converter foto para Base64 se existir
      // ========================================
      let fotoBase64 = null;
      if (form.foto) {
        try {
          console.log('📸 Convertendo foto para Base64...');
          fotoBase64 = await convertFileToBase64(form.foto);
          console.log('✅ Foto convertida! (primeiros 100 chars):', fotoBase64?.substring(0, 100));
        } catch (error) {
          console.error('❌ Erro ao converter foto:', error);
          setModalErro({ open: true, mensagem: 'Erro ao processar a foto. Tente novamente.' });
          setCadastrando(false);
          return;
        }
      }

      // ========================================
      // Montar payload completo
      // ========================================
      const dadosBeneficiado = {
        nome: dadosCompleto2.nome,
        cpf: dadosCompleto2.cpf,
        rg: dadosCompleto2.rg,
        dataNascimento: convertDateToISO(dadosCompleto2.nascimento),
        telefone: dadosCompleto2.telefone,
        escolaridade: dadosCompleto2.escolaridade,
        estadoCivil: dadosCompleto2.estadoCivil,
        religiao: dadosCompleto2.religiao,
        profissao: form.profissao,
        empresa: form.empresa,
        cargo: form.cargo,
        rendaMensal: parseReais(form.renda),
        quantidadeDependentes: parseInt(form.dependentes) || 0,
        enderecoId: enderecoSelecionado.id,
        fotoBeneficiado: fotoBase64 // ✅ String Base64 - o service fará upload separado e receberá fotoId
      };

      console.log('📦 Enviando cadastro completo...');
      console.log('   - Nome:', dadosBeneficiado.nome);
      console.log('   - CPF:', dadosBeneficiado.cpf);
      console.log('   - Endereço ID:', dadosBeneficiado.enderecoId);
      console.log('   - Foto:', fotoBase64 ? 'Presente (será feito upload separado)' : 'Não fornecida');
      
      // O service vai fazer:
      // 1. Upload da foto (POST /files) e pegar o fotoId
      // 2. Cadastrar beneficiado (POST /beneficiados) com fotoId
      const response = await beneficiadoService.cadastrarBeneficiadoCompleto(dadosBeneficiado);
      
      if (response.success) {
        console.log('Beneficiado cadastrado com sucesso:', response.data);
        
        // Limpar dados temporários
        sessionStorage.removeItem("enderecoSelecionado");
        sessionStorage.removeItem("dadosCompleto2");
        
        setModalSucesso({ open: true, mensagem: 'Beneficiado cadastrado com sucesso!' });
      } else {
        console.error('Erro no cadastro:', response.error);
        // Não mostrar mensagem técnica do backend
        setModalErro({ open: true, mensagem: 'Erro ao cadastrar beneficiado. Verifique os dados e tente novamente.' });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setModalErro({ open: true, mensagem: 'Erro inesperado. Tente novamente.' });
    } finally {
      setCadastrando(false);
    }
  }

  return (
    <div className="cadastro-completo3-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
      
      <div className="cadastro-completo3-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="cadastro-completo3-icone-voltar"
          onClick={() => navigate("/cadastro-beneficiado-completo2")}
        />
        
        <h1 className="cadastro-completo3-title">Cadastro de Beneficiado</h1>
        
        {/* Indicador de progresso */}
        <div className="cadastro-completo3-progress-container">
          <div className="cadastro-completo3-progress-step completed">
            <div className="cadastro-completo3-progress-circle"></div>
            <span className="cadastro-completo3-progress-label">Passo 1</span>
          </div>
          <div className="cadastro-completo3-progress-line completed"></div>
          <div className="cadastro-completo3-progress-step completed">
            <div className="cadastro-completo3-progress-circle"></div>
            <span className="cadastro-completo3-progress-label">Passo 2</span>
          </div>
          <div className="cadastro-completo3-progress-line completed"></div>
          <div className="cadastro-completo3-progress-step active">
            <div className="cadastro-completo3-progress-circle"></div>
            <span className="cadastro-completo3-progress-label">Passo 3</span>
          </div>
        </div>
        {/* Modal de sucesso/erro */}
        <Modal
          isOpen={modalSucesso.open}
          onClose={() => { setModalSucesso({ open: false, mensagem: "" }); setModalFilhos(true); }}
          texto={modalSucesso.mensagem}
          showClose={false}
        />
        
        {/* Modal de erro */}
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={false}
        />
        {/* Modal de pergunta filhos usando Modal padrão */}
        <Modal
          isOpen={modalFilhos}
          onClose={() => { setModalFilhos(false); setModalAuxilios(true); }}
          texto="Deseja cadastrar filhos?"
          showClose={false}
          botoes={[
            {
              texto: 'Sim',
              onClick: () => { 
                setModalFilhos(false); 
                // Marcar que vai cadastrar filhos para depois mostrar modal de auxílios
                sessionStorage.setItem('voltarParaAuxilios', 'true');
                navigate('/cadastro-filhos'); 
              },
              style: { background: '#ededed', color: '#222', minWidth: 120, minHeight: 44, fontSize: 18 }
            },
            {
              texto: 'Não',
              onClick: () => { setModalFilhos(false); setModalAuxilios(true); },
              style: { background: '#111', color: '#fff', border: '2px solid #111', minWidth: 120, minHeight: 44, fontSize: 18 }
            }
            
          ]}
        />
        {/* Modal de pergunta auxílios usando Modal padrão */}
        <Modal
          isOpen={modalAuxilios}
          onClose={() => { setModalAuxilios(false); navigate('/cadastro-beneficiado-menu'); }}
          texto="Deseja cadastrar auxílios governamentais?"
          showClose={false}
          botoes={[
            {
              texto: 'Sim',
              onClick: () => { setModalAuxilios(false); navigate('/cadastro-auxilios'); },
              style: { background: '#ededed', color: '#222', minWidth: 120, minHeight: 44, fontSize: 18 }
            },
            {
              texto: 'Não',
              onClick: () => { setModalAuxilios(false); navigate('/cadastro-beneficiado-menu'); },
              style: { background: '#111', color: '#fff', border: '2px solid #111', minWidth: 120, minHeight: 44, fontSize: 18 }
            }
            
          ]}
        />
        
        {/* Modal de foto muito grande */}
        <Modal
          isOpen={modalFotoGrande}
          onClose={() => setModalFotoGrande(false)}
          texto="A foto selecionada excede o tamanho máximo permitido de 800 KB."
          showClose={true}
        />

        <form onSubmit={handleSubmit} className="cadastro-completo3-form" autoComplete="off">
          {/* Primeira linha - Profissão, Empresa, Dependentes */}
          <div className="cadastro-completo3-row-triple">
            <div className="cadastro-completo3-field">
              <label className="cadastro-completo3-label">Profissão:</label>
              <Input
                name="profissao"
                placeholder="Insira a profissão"
                value={form.profissao}
                onChange={handleChange}
                className="cadastro-completo3-input"
              />
            </div>
            <div className="cadastro-completo3-field">
              <label className="cadastro-completo3-label">Empresa:</label>
              <Input
                name="empresa"
                placeholder="Insira o nome da empresa"
                value={form.empresa}
                onChange={handleChange}
                className="cadastro-completo3-input"
              />
            </div>
            <div className="cadastro-completo3-field">
              <label className="cadastro-completo3-label">Dependentes:</label>
              <Input
                name="dependentes"
                placeholder="Insira a quantidade"
                value={form.dependentes}
                onChange={handleChange}
                className="cadastro-completo3-input"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>

          {/* Segunda linha - Renda, Cargo, Foto */}
          <div className="cadastro-completo3-row-triple">
            <div className="cadastro-completo3-field">
              <label className="cadastro-completo3-label">Renda Mensal:</label>
              <Input
                name="renda"
                placeholder="R$ 0,00"
                value={form.renda}
                onChange={handleChange}
                className="cadastro-completo3-input"
              />
            </div>
            <div className="cadastro-completo3-field">
              <label className="cadastro-completo3-label">Cargo:</label>
              <Input
                name="cargo"
                placeholder="Auxiliar de Limpeza"
                value={form.cargo}
                onChange={handleChange}
                className="cadastro-completo3-input"
              />
            </div>
            <div className="cadastro-completo3-field">
              <label className="cadastro-completo3-label">
                Foto do Beneficiado: 
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}></span>
              </label>
              <input
                name="foto"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="cadastro-completo3-input"
                style={{ transform: 'translateY(-4px)' }}
                title="Selecione um arquivo de imagem (máximo 800KB)"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-5px', width: 'calc(100% + 55px)' }}>
            <Botao 
              texto="Voltar" 
              onClick={() => navigate("/cadastro-beneficiado-completo2")}
              className="cadastro-completo3-btn" 
              style={{ position: 'relative', left: '5px' }}
            />
            <Botao 
              texto={cadastrando ? "Cadastrando..." : "Cadastrar"} 
              type="submit" 
              className="cadastro-completo3-btn"
              disabled={cadastrando}
              style={{ position: 'relative', right: '60px' }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
