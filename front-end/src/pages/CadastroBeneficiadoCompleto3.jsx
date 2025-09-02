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
import { Download } from 'lucide-react';

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
  const [modalFilhos, setModalFilhos] = useState(false);
  const [modalAuxilios, setModalAuxilios] = useState(false);
  const [modalTimeout, setModalTimeout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tipo = sessionStorage.getItem('tipoUsuario') || '2';
    setTipoUsuario(tipo);
  }, []);

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

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'foto') {
      setForm({ ...form, foto: files[0] });
    } else if (name === 'renda') {
      setForm({ ...form, renda: formatReais(value) });
    } else if (name === 'dependentes') {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: onlyNumbers });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setModalSucesso({ open: true, mensagem: 'Beneficiado cadastrado com sucesso!' });
  }

  return (
    <div className="cadastro-beneficiado-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="cadastro-beneficiado-container">
        <div className="cadastro-beneficiado-voltar">
          <Voltar onClick={() => navigate('/cadastro-beneficiado-completo2')} />
        </div>
        <div className="cadastro-beneficiado-header">
          <h1 className="cadastro-beneficiado-title">Cadastro de Beneficiado</h1>
          <span className="cadastro-beneficiado-passo">Passo: 3/3</span>
        </div>
        {/* Modal de sucesso/erro */}
        <Modal
          isOpen={modalSucesso.open}
          onClose={() => { setModalSucesso({ open: false, mensagem: "" }); setModalFilhos(true); }}
          texto={modalSucesso.mensagem}
          showClose={true}
        />
        {/* Modal de pergunta filhos usando Modal padrão */}
        <Modal
          isOpen={modalFilhos}
          onClose={() => { setModalFilhos(false); setModalAuxilios(true); }}
          texto="Deseja cadastrar filhos?"
          showClose={true}
          botoes={[
            {
              texto: 'NÃO',
              onClick: () => { setModalFilhos(false); setModalAuxilios(true); },
              style: { background: '#111', color: '#fff', border: '2px solid #111', minWidth: 120, minHeight: 44, fontSize: 18 }
            },
            {
              texto: 'SIM',
              onClick: () => { setModalFilhos(false); navigate('/cadastro-filhos'); },
              style: { background: '#ededed', color: '#222', minWidth: 120, minHeight: 44, fontSize: 18 }
            }
          ]}
        />
        {/* Modal de pergunta auxílios usando Modal padrão */}
        <Modal
          isOpen={modalAuxilios}
          onClose={() => { setModalAuxilios(false); navigate('/cadastro-beneficiado-menu'); }}
          texto="Deseja cadastrar auxílios governamentais?"
          showClose={true}
          botoes={[
            {
              texto: 'NÃO',
              onClick: () => { setModalAuxilios(false); navigate('/cadastro-beneficiado-menu'); },
              style: { background: '#111', color: '#fff', border: '2px solid #111', minWidth: 120, minHeight: 44, fontSize: 18 }
            },
            {
              texto: 'SIM',
              onClick: () => { setModalAuxilios(false); navigate('/cadastro-auxilios'); },
              style: { background: '#ededed', color: '#222', minWidth: 120, minHeight: 44, fontSize: 18 }
            }
          ]}
        />
        <form className="cadastro-beneficiado-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="cadastro-beneficiado-grid">
            <div className="cadastro-beneficiado-col">
              <div className="cadastro-beneficiado-field">
                <label htmlFor="profissao">Profissão:</label>
                <Input
                  id="profissao"
                  name="profissao"
                  placeholder="Insira a profissão"
                  value={form.profissao}
                  onChange={handleChange}
                  className="cadastro-beneficiado-input"
                />
              </div>
              <div className="cadastro-beneficiado-field">
                <label htmlFor="empresa">Empresa:</label>
                <Input
                  id="empresa"
                  name="empresa"
                  placeholder="Insira o nome da empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  className="cadastro-beneficiado-input"
                />
              </div>
              <div className="cadastro-beneficiado-field">
                <label htmlFor="dependentes">Quantidade de Dependentes:</label>
                <Input
                  id="dependentes"
                  name="dependentes"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.dependentes}
                  onChange={handleChange}
                  className="cadastro-beneficiado-input"
                />
              </div>
            </div>
            <div className="cadastro-beneficiado-col">
              <div className="cadastro-beneficiado-field">
                <label htmlFor="renda">Renda Mensal:</label>
                <Input
                  id="renda"
                  name="renda"
                  placeholder="R$ 0,00"
                  value={form.renda}
                  onChange={handleChange}
                  className="cadastro-beneficiado-input"
                />
              </div>
              <div className="cadastro-beneficiado-field">
                <label htmlFor="cargo">Cargo:</label>
                <Input
                  id="cargo"
                  name="cargo"
                  placeholder="Auxiliar de Limpeza"
                  value={form.cargo}
                  onChange={handleChange}
                  className="cadastro-beneficiado-input"
                />
              </div>
              <div className="cadastro-beneficiado-field" style={{ position: 'relative' }}>
                <label htmlFor="foto">Foto do Beneficiado:</label>
                <input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="cadastro-beneficiado-input"
                  style={{ paddingRight: 40 }}
                  title="Selecione um arquivo"
                />
                <span style={{ position: 'absolute', right: 18, top: 38 }}><Download size={24} /></span>
              </div>
            </div>
          </div>
          <div className="cadastro-beneficiado-btn-row">
            <Botao texto="Cadastrar" type="submit" className="cadastrobeneficiado-botao" />
          </div>
        </form>
      </div>
    </div>
  );
}
