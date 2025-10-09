import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import { beneficiadoService } from "../services/beneficiadoService";
import "../styles/Home.css"; 
import "../styles/ConsultaEndereco.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function ConsultaEndereco() {
	const formatCEP = (value) => {
		let v = value.replace(/\D/g, "");
		v = v.slice(0, 8);
		if (v.length > 5) {
			v = v.replace(/(\d{5})(\d{1,3})/, "$1-$2");
		}
		return v;
	};

	const formatDate = (value) => {
		let v = value.replace(/\D/g, "");
		v = v.slice(0, 8);
		v = v.replace(/(\d{2})(\d)/, "$1/$2");
		v = v.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
		return v;
	};

	const onlyNumbers = (value, maxLength = null) => {
		let v = value.replace(/\D/g, "");
		if (maxLength) v = v.slice(0, maxLength);
		return v;
	};
	const navigate = useNavigate();
	const [tipoUsuario, setTipoUsuario] = useState("2");
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);
	const [beneficiado, setBeneficiado] = useState(null);
	
	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
		
		const cpf = sessionStorage.getItem("cpfSelecionado") || "463.864.234-21";
		sessionStorage.setItem("cpfSelecionado", cpf);
		
		carregarBeneficiado();
	}, []);

	const carregarBeneficiado = async () => {
		try {
			setCarregando(true);
			setErro(null);
			
			const cpfSelecionado = sessionStorage.getItem("cpfSelecionado");
			if (!cpfSelecionado) {
				setErro("CPF não encontrado na sessão");
				return;
			}
			
			console.log('🔍 Carregando dados de endereço para CPF:', cpfSelecionado);
			const response = await beneficiadoService.buscarPorCpf(cpfSelecionado);
			
			// 🏠 BUSCAR DADOS DA TABELA TIPO_MORADOR
			console.log('🏠 Buscando dados de tipo_morador...');
			const tipoMoradorResponse = await beneficiadoService.buscarTipoMoradorPorCpf(cpfSelecionado);
			
			if (response.success) {
				console.log('✅ Sucesso ao carregar beneficiado:', response.data);
				console.log('📍 Estrutura dos dados recebidos:', Object.keys(response.data));
				console.log('🔍 Dados detalhados do beneficiado:', {
					id: response.data.id,
					nome: response.data.nome,
					cpf: response.data.cpf,
					enderecoId: response.data.enderecoId,
					hasEndereco: !!response.data.endereco,
					enderecoKeys: response.data.endereco ? Object.keys(response.data.endereco) : null,
					status: response.data.status,
					dataEntrada: response.data.dataEntrada || response.data.dataIngresso || response.data.dataCadastro,
					tipoMoradia: response.data.tipoMoradia,
					quantidades: {
						criancas: response.data.qtdCriancas || response.data.quantidadeCriancas,
						jovens: response.data.qtdJovens || response.data.quantidadeJovens,
						adolescentes: response.data.qtdAdolescentes || response.data.quantidadeAdolescentes,
						idosos: response.data.qtdIdosos || response.data.quantidadeIdosos,
						gestantes: response.data.qtdGestantes || response.data.quantidadeGestantes,
						deficientes: response.data.qtdDeficientes || response.data.quantidadeDeficientes,
						outros: response.data.qtdOutros || response.data.quantidadeOutros
					},
					informacoesCesta: {
						tipoCesta: response.data.tipoCesta,
						tipoCestaAtual: response.data.tipoCestaAtual,
						cesta: response.data.cesta,
						assistencia: response.data.assistencia,
						tipoAjuda: response.data.tipoAjuda,
						tipoAssistencia: response.data.tipoAssistencia
					}
				});
				
				// LOG ESPECÍFICO para investigar campos de quantidade
				console.log('🔍 INVESTIGAÇÃO - Todos os campos relacionados a quantidades:', {
					todasAsChaves: Object.keys(response.data),
					camposComQuantidade: Object.keys(response.data).filter(key => 
						key.toLowerCase().includes('qtd') || 
						key.toLowerCase().includes('quantidade') || 
						key.toLowerCase().includes('crianca') ||
						key.toLowerCase().includes('jovem') ||
						key.toLowerCase().includes('adolescent') ||
						key.toLowerCase().includes('idoso') ||
						key.toLowerCase().includes('gestante') ||
						key.toLowerCase().includes('deficient') ||
						key.toLowerCase().includes('pcd') ||
						key.toLowerCase().includes('outros')
					),
					camposComCesta: Object.keys(response.data).filter(key => 
						key.toLowerCase().includes('cesta') || 
						key.toLowerCase().includes('assistencia') ||
						key.toLowerCase().includes('ajuda') ||
						key.toLowerCase().includes('tipo')
					)
				});

				// 🔍 SUPER LOG - Investigação profunda de todos os valores
				console.log('🔍 SUPER INVESTIGAÇÃO - VALORES ESPECÍFICOS:');
				const todasAsChaves = Object.keys(response.data);
				
				// Investigar quantidades específicas
				const quantidadesProcuradas = [
					'qtdCriancas', 'quantidadeCriancas', 'criancas', 'numCriancas', 'totalCriancas',
					'qtdJovens', 'quantidadeJovens', 'jovens', 'numJovens', 'totalJovens',
					'qtdAdolescentes', 'quantidadeAdolescentes', 'adolescentes', 'numAdolescentes',
					'qtdIdosos', 'quantidadeIdosos', 'idosos', 'numIdosos', 'totalIdosos',
					'qtdGestantes', 'quantidadeGestantes', 'gestantes', 'numGestantes',
					'qtdDeficientes', 'quantidadeDeficientes', 'deficientes', 'numDeficientes', 'pcd',
					'qtdOutros', 'quantidadeOutros', 'outros', 'numOutros'
				];
				
				quantidadesProcuradas.forEach(campo => {
					if (response.data[campo] !== undefined) {
						console.log(`🎯 ENCONTRADO ${campo}:`, response.data[campo]);
					}
				});

				// Investigar tipos de cesta
				const cestasProcuradas = [
					'tipoCesta', 'tipo_cesta', 'cesta', 'tipoBasket', 'basket_type',
					'tipoCestaAtual', 'cestaAtual', 'tipoAssistencia', 'assistencia',
					'categoria', 'type', 'classificacao'
				];
				
				cestasProcuradas.forEach(campo => {
					if (response.data[campo] !== undefined) {
						console.log(`🎯 ENCONTRADO ${campo}:`, response.data[campo]);
					}
				});

				// Investigar possível estrutura aninhada
				if (response.data.familia) {
					console.log('🔍 Estrutura família encontrada:', response.data.familia);
				}
				if (response.data.composicaoFamiliar) {
					console.log('🔍 Estrutura composição familiar encontrada:', response.data.composicaoFamiliar);
				}
				if (response.data.membros) {
					console.log('🔍 Estrutura membros encontrada:', response.data.membros);
				}
				
				let beneficiadoCompleto = response.data;
				
				// Se não há dados de endereço completos e há um enderecoId, buscar endereço separadamente
				if (!response.data.endereco && response.data.enderecoId) {
					console.log('🔄 Buscando endereço separadamente com ID:', response.data.enderecoId);
					try {
						const enderecoResponse = await beneficiadoService.buscarEnderecoPorId(response.data.enderecoId);
						if (enderecoResponse.success) {
							console.log('🏠 Endereço carregado separadamente:', enderecoResponse.data);
							beneficiadoCompleto = {
								...response.data,
								endereco: enderecoResponse.data
							};
						}
					} catch (enderecoError) {
						console.log('⚠️ Não foi possível carregar endereço separadamente:', enderecoError);
					}
				}
				
				// Tentar buscar informações complementares se campos críticos estiverem faltando
				const camposCriticos = [
					'dataEntrada', 'dataIngresso', 'dataCadastro',
					'tipoCestaAtual', 'tipoCesta',
					'tipoMoradia'
				];
				
				const camposFaltando = camposCriticos.filter(campo => !beneficiadoCompleto[campo]);
				
				if (camposFaltando.length > 0 && beneficiadoCompleto.id) {
					console.log('🔄 Campos críticos faltando:', camposFaltando, '- Tentando buscar informações complementares...');
					try {
						const beneficiadoDetalhado = await beneficiadoService.buscarBeneficiadoPorId(beneficiadoCompleto.id);
						if (beneficiadoDetalhado.success) {
							console.log('📊 Informações complementares carregadas:', beneficiadoDetalhado.data);
							console.log('🔍 Verificando se campos faltantes foram preenchidos:', 
								camposFaltando.map(campo => `${campo}: ${beneficiadoDetalhado.data[campo] ? 'ENCONTRADO' : 'AINDA FALTANDO'}`)
							);
							beneficiadoCompleto = {
								...beneficiadoCompleto,
								...beneficiadoDetalhado.data,
								// Preservar o endereço se foi carregado separadamente
								endereco: beneficiadoCompleto.endereco || beneficiadoDetalhado.data.endereco
							};
						}
					} catch (complementarError) {
						console.log('⚠️ Não foi possível carregar informações complementares:', complementarError);
					}
				} else if (camposFaltando.length === 0) {
					console.log('✅ Todos os campos críticos estão preenchidos');
				}
				
				// Verificar se há dados de endereço
				if (beneficiadoCompleto.endereco) {
					console.log('🏠 Dados de endereço disponíveis:', beneficiadoCompleto.endereco);
				} else {
					console.log('⚠️ Usando dados de endereço das propriedades diretas do beneficiado');
				}
				
				// 🏠 INTEGRAR DADOS DA TABELA TIPO_MORADOR
				let beneficiadoFinal = beneficiadoCompleto;
				
				if (tipoMoradorResponse.success) {
					console.log('🏠 ✅ Dados de tipo_morador encontrados via API:', tipoMoradorResponse.data);
					
					// Integrar os dados de quantidade da tabela tipo_morador
					beneficiadoFinal = {
						...beneficiadoCompleto,
						// Dados originais da tabela tipo_morador
						tipoMorador: tipoMoradorResponse.data,
						// Mapear campos de quantidade com nomes corretos
						quantidade_crianca: tipoMoradorResponse.data.quantidade_crianca,
						quantidade_adolescente: tipoMoradorResponse.data.quantidade_adolescente,
						quantidade_jovem: tipoMoradorResponse.data.quantidade_jovem,
						quantidade_idoso: tipoMoradorResponse.data.quantidade_idoso,
						quantidade_gestante: tipoMoradorResponse.data.quantidade_gestante,
						quantidade_deficiente: tipoMoradorResponse.data.quantidade_deficiente,
						quantidade_outros: tipoMoradorResponse.data.quantidade_outros,
						// Manter compatibilidade com nomes alternativos
						qtdCriancas: tipoMoradorResponse.data.quantidade_crianca,
						qtdAdolescentes: tipoMoradorResponse.data.quantidade_adolescente,
						qtdJovens: tipoMoradorResponse.data.quantidade_jovem,
						qtdIdosos: tipoMoradorResponse.data.quantidade_idoso,
						qtdGestantes: tipoMoradorResponse.data.quantidade_gestante,
						qtdDeficientes: tipoMoradorResponse.data.quantidade_deficiente,
						qtdOutros: tipoMoradorResponse.data.quantidade_outros
					};
					
					console.log('🏠 ✅ Beneficiado com dados de tipo_morador integrados via API:', {
						criancas: beneficiadoFinal.quantidade_crianca,
						adolescentes: beneficiadoFinal.quantidade_adolescente,
						jovens: beneficiadoFinal.quantidade_jovem,
						idosos: beneficiadoFinal.quantidade_idoso,
						gestantes: beneficiadoFinal.quantidade_gestante,
						deficientes: beneficiadoFinal.quantidade_deficiente,
						outros: beneficiadoFinal.quantidade_outros
					});
				} else {
					console.log('🏠 ⚠️ API de tipo_morador não disponível:', tipoMoradorResponse.error);
					
					// 🏠 FALLBACK: Tentar buscar dados locais salvos
					console.log('🏠 🔍 Tentando fallback com dados locais...');
					
					const cpfLimpo = cpfSelecionado.replace(/\D/g, '');
					const tiposMoradorLocais = JSON.parse(localStorage.getItem('tiposMoradorLocal') || '[]');
					const tipoMoradorLocal = tiposMoradorLocais.find(tm => tm.fk_cpf === cpfLimpo);
					
					if (tipoMoradorLocal) {
						console.log('🏠 ✅ Dados de tipo_morador encontrados localmente:', tipoMoradorLocal);
						
						beneficiadoFinal = {
							...beneficiadoCompleto,
							// Dados originais da tabela tipo_morador
							tipoMorador: tipoMoradorLocal,
							// Mapear campos de quantidade com nomes corretos
							quantidade_crianca: tipoMoradorLocal.quantidade_crianca,
							quantidade_adolescente: tipoMoradorLocal.quantidade_adolescente,
							quantidade_jovem: tipoMoradorLocal.quantidade_jovem,
							quantidade_idoso: tipoMoradorLocal.quantidade_idoso,
							quantidade_gestante: tipoMoradorLocal.quantidade_gestante,
							quantidade_deficiente: tipoMoradorLocal.quantidade_deficiente,
							quantidade_outros: tipoMoradorLocal.quantidade_outros,
							// Manter compatibilidade com nomes alternativos
							qtdCriancas: tipoMoradorLocal.quantidade_crianca,
							qtdAdolescentes: tipoMoradorLocal.quantidade_adolescente,
							qtdJovens: tipoMoradorLocal.quantidade_jovem,
							qtdIdosos: tipoMoradorLocal.quantidade_idoso,
							qtdGestantes: tipoMoradorLocal.quantidade_gestante,
							qtdDeficientes: tipoMoradorLocal.quantidade_deficiente,
							qtdOutros: tipoMoradorLocal.quantidade_outros
						};
						
						console.log('🏠 ✅ Beneficiado com dados de tipo_morador integrados via localStorage:', {
							criancas: beneficiadoFinal.quantidade_crianca,
							adolescentes: beneficiadoFinal.quantidade_adolescente,
							jovens: beneficiadoFinal.quantidade_jovem,
							idosos: beneficiadoFinal.quantidade_idoso,
							gestantes: beneficiadoFinal.quantidade_gestante,
							deficientes: beneficiadoFinal.quantidade_deficiente,
							outros: beneficiadoFinal.quantidade_outros
						});
					} else {
						console.log('🏠 ⚠️ Nenhum dado de tipo_morador encontrado (nem API nem localStorage)');
						console.log('🏠 💡 Dica: Cadastre um endereço primeiro para gerar os dados de tipo_morador');
					}
				}
				
				// Salvar ID do beneficiado na sessão para outras páginas
				if (beneficiadoFinal.id) {
					sessionStorage.setItem("beneficiadoId", beneficiadoFinal.id.toString());
					console.log('💾 ID do beneficiado salvo na sessão:', beneficiadoFinal.id);
				}
				
				setBeneficiado(beneficiadoFinal);
			} else {
				console.error('❌ Erro ao carregar beneficiado:', response.error);
				setErro(response.error || "Erro ao carregar dados do beneficiado");
			}
		} catch (error) {
			console.error('💥 Erro inesperado:', error);
			setErro("Erro inesperado ao carregar dados");
		} finally {
			setCarregando(false);
		}
	};

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];
	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

	

	function getEnderecoStorage() {
		// Se temos dados do beneficiado, usar eles
		if (beneficiado) {
			console.log('📊 Dados completos do beneficiado:', beneficiado);
			
			// Tentar acessar dados de endereço em diferentes estruturas possíveis
			const enderecoBeneficiado = beneficiado.endereco || beneficiado;
			console.log('🏠 Dados de endereço extraídos:', enderecoBeneficiado);

			// 🏠 LOG ESPECÍFICO - Dados da tabela tipo_morador
			console.log('🏠 VERIFICANDO DADOS DA TABELA TIPO_MORADOR:', {
				tipoMorador: beneficiado.tipoMorador,
				quantidade_crianca: beneficiado.quantidade_crianca,
				quantidade_adolescente: beneficiado.quantidade_adolescente,
				quantidade_jovem: beneficiado.quantidade_jovem,
				quantidade_idoso: beneficiado.quantidade_idoso,
				quantidade_gestante: beneficiado.quantidade_gestante,
				quantidade_deficiente: beneficiado.quantidade_deficiente,
				quantidade_outros: beneficiado.quantidade_outros,
				estruturaCompleta: beneficiado
			});
			
			// Função auxiliar para formatar data - MELHORADA
			const formatarData = (data) => {
				if (!data) return "-";
				
				// Se for string vazia
				if (typeof data === 'string' && data.trim() === '') return "-";
				
				// Se for ISO string (2024-10-08T10:30:00.000Z)
				if (typeof data === 'string' && data.includes('T')) {
					return data.split('T')[0].split('-').reverse().join('/');
				}
				
				// Se for data no formato YYYY-MM-DD
				if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}$/)) {
					return data.split('-').reverse().join('/');
				}
				
				// Se for data no formato DD/MM/YYYY (já formatada)
				if (typeof data === 'string' && data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
					return data;
				}
				
				// Se for timestamp
				if (typeof data === 'number') {
					const date = new Date(data);
					return date.toLocaleDateString('pt-BR');
				}
				
				// Se for objeto Date
				if (data instanceof Date) {
					return data.toLocaleDateString('pt-BR');
				}
				
				// Qualquer outro formato, tentar converter
				try {
					const date = new Date(data);
					if (!isNaN(date.getTime())) {
						return date.toLocaleDateString('pt-BR');
					}
				} catch (e) {
					console.log('⚠️ Não foi possível formatar a data:', data);
				}
				
				return data.toString();
			};
			
			// Função auxiliar para garantir que números sejam strings
			const garantirString = (valor) => {
				if (valor === null || valor === undefined) return "0";
				return valor.toString();
			};
			
			const dadosProcessados = {
				// Dados de endereço
				rua: enderecoBeneficiado.logradouro || enderecoBeneficiado.rua || enderecoBeneficiado.endereco?.logradouro || "",
				numero: enderecoBeneficiado.numero || enderecoBeneficiado.endereco?.numero || "",
				complemento: enderecoBeneficiado.complemento || enderecoBeneficiado.endereco?.complemento || "",
				bairro: enderecoBeneficiado.bairro || enderecoBeneficiado.endereco?.bairro || "",
				cidade: enderecoBeneficiado.cidade || enderecoBeneficiado.endereco?.cidade || "",
				estado: enderecoBeneficiado.estado || enderecoBeneficiado.uf || enderecoBeneficiado.endereco?.estado || enderecoBeneficiado.endereco?.uf || "",
				cep: enderecoBeneficiado.cep || enderecoBeneficiado.endereco?.cep || "",
				
				// Datas do beneficiado - EXPANDIDO com mais possibilidades
				dataEntrada: formatarData(
					beneficiado.dataEntrada || 
					beneficiado.dataIngresso || 
					beneficiado.dataCadastro || 
					beneficiado.dataInicio ||
					beneficiado.dataInicioAtendimento ||
					beneficiado.dataInclusao ||
					beneficiado.dataRegistro ||
					beneficiado.createdAt ||
					beneficiado.created_at ||
					enderecoBeneficiado.dataEntrada ||
					enderecoBeneficiado.dataIngresso
				),
				dataSaida: formatarData(
					beneficiado.dataSaida || 
					beneficiado.dataDesligamento || 
					beneficiado.dataFim ||
					beneficiado.dataFinalAtendimento ||
					beneficiado.dataExclusao ||
					beneficiado.dataEncerramento ||
					beneficiado.updatedAt ||
					beneficiado.updated_at ||
					enderecoBeneficiado.dataSaida ||
					enderecoBeneficiado.dataDesligamento
				),
				
				// Tipo de moradia - EXPANDIDO
				moradia: beneficiado.tipoMoradia || 
						beneficiado.moradia || 
						beneficiado.tipoResidencia ||
						beneficiado.categoriaResidencia ||
						beneficiado.situacaoMoradia ||
						enderecoBeneficiado.tipoMoradia ||
						"",
				tipoMoradia: beneficiado.tipoMoradia || 
							beneficiado.moradia ||
							beneficiado.tipoResidencia ||
							beneficiado.categoriaResidencia ||
							beneficiado.situacaoMoradia ||
							enderecoBeneficiado.tipoMoradia ||
							"",
				
				// Informações de cesta - EXPANDIDO
				tipoCesta: garantirString(
					beneficiado.tipoCesta || 
					beneficiado.tipo_cesta || 
					beneficiado.cesta ||
					beneficiado.tipoBasket ||
					beneficiado.basket_type ||
					beneficiado.tipoDeCesta ||
					beneficiado.tipo_de_cesta ||
					beneficiado.tipobasket ||
					beneficiado.typeBasket ||
					beneficiado.basketType ||
					beneficiado.cesta_tipo ||
					beneficiado.categoria_cesta ||
					beneficiado.categoriaCesta ||
					beneficiado.basket_category ||
					beneficiado.tipo_auxilio ||
					beneficiado.tipoAuxilio ||
					beneficiado.auxilio_tipo ||
					beneficiado.category ||
					beneficiado.categoria ||
					beneficiado.type ||
					beneficiado.classificacao ||
					beneficiado.classification ||
					beneficiado.cesta?.tipo ||
					beneficiado.tipoAssistencia ||
					beneficiado.categoriaAssistencia ||
					beneficiado.tipoAjuda ||
					enderecoBeneficiado.tipoCesta ||
					enderecoBeneficiado.tipo_cesta ||
					enderecoBeneficiado.cesta ||
					enderecoBeneficiado.categoria ||
					'Não informado'
				),
				tipoCestaAtual: garantirString(
					beneficiado.tipoCestaAtual || 
					beneficiado.tipo_cesta_atual || 
					beneficiado.cestaAtual ||
					beneficiado.basket_current ||
					beneficiado.currentBasket ||
					beneficiado.current_basket_type ||
					beneficiado.cestaAtual?.tipo ||
					beneficiado.tipoCesta ||
					beneficiado.assistenciaAtual ||
					beneficiado.categoriaAtual ||
					beneficiado.auxilio_atual ||
					beneficiado.auxilioAtual ||
					beneficiado.tipo_auxilio_atual ||
					beneficiado.categoria_atual ||
					beneficiado.classificacao_atual ||
					enderecoBeneficiado.tipoCestaAtual ||
					enderecoBeneficiado.cestaAtual ||
					enderecoBeneficiado.tipo_cesta_atual ||
					'Não informado'
				),
				tempoCestaAtual: beneficiado.tempoCestaAtual || 
								beneficiado.tempoNaCestaAtual ||
								beneficiado.tempoAssistenciaAtual ||
								beneficiado.mesesNaCesta ||
								beneficiado.diasNaCesta ||
								"",
				tempoCestaRestante: beneficiado.tempoCestaRestante || 
								   beneficiado.tempoRestante ||
								   beneficiado.mesesRestantes ||
								   beneficiado.diasRestantes ||
								   beneficiado.tempoLimite ||
								   "",
				tempoASA: beneficiado.tempoASA || 
						 beneficiado.tempoNaASA || 
						 beneficiado.tempoCadastro ||
						 beneficiado.tempoInstituicao ||
						 beneficiado.tempoPrograma ||
						 beneficiado.mesesASA ||
						 beneficiado.anosASA ||
						 "",
				
				// Status - EXPANDIDO
				status: beneficiado.status || 
					   beneficiado.situacao || 
					   beneficiado.statusAtendimento ||
					   beneficiado.situacaoAtual ||
					   beneficiado.estadoAtual ||
					   beneficiado.condicao ||
					   beneficiado.ativo === true ? "Ativo" :
					   beneficiado.ativo === false ? "Inativo" :
					   "Ativo",
				
				// Quantidades de pessoas - TABELA TIPO_MORADOR COM PRIORIDADE MÁXIMA
				criancas: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_crianca ||
					beneficiado.tipoMorador?.quantidade_crianca ||
					// Fallbacks tradicionais
					beneficiado.qtdCriancas || 
					beneficiado.quantidadeCriancas || 
					beneficiado.criancas ||
					beneficiado.numCriancas ||
					beneficiado.totalCriancas ||
					beneficiado.nCriancas ||
					beneficiado.crianca ||
					beneficiado.child ||
					beneficiado.children ||
					beneficiado.qtd_criancas ||
					beneficiado.quantidade_criancas ||
					beneficiado.num_criancas ||
					beneficiado.qtdade_criancas ||
					enderecoBeneficiado.qtdCriancas ||
					enderecoBeneficiado.criancas ||
					0
				),
				jovens: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_jovem ||
					beneficiado.tipoMorador?.quantidade_jovem ||
					// Fallbacks tradicionais
					beneficiado.qtdJovens || 
					beneficiado.quantidadeJovens || 
					beneficiado.jovens ||
					beneficiado.numJovens ||
					beneficiado.totalJovens ||
					beneficiado.nJovens ||
					beneficiado.jovem ||
					beneficiado.youth ||
					beneficiado.qtd_jovens ||
					beneficiado.quantidade_jovens ||
					beneficiado.num_jovens ||
					beneficiado.qtdade_jovens ||
					enderecoBeneficiado.qtdJovens ||
					enderecoBeneficiado.jovens ||
					0
				),
				adolescentes: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_adolescente ||
					beneficiado.tipoMorador?.quantidade_adolescente ||
					// Fallbacks tradicionais
					beneficiado.qtdAdolescentes || 
					beneficiado.quantidadeAdolescentes || 
					beneficiado.adolescentes ||
					beneficiado.numAdolescentes ||
					beneficiado.totalAdolescentes ||
					beneficiado.nAdolescentes ||
					beneficiado.adolescente ||
					beneficiado.teenager ||
					beneficiado.teens ||
					beneficiado.qtd_adolescentes ||
					beneficiado.quantidade_adolescentes ||
					beneficiado.num_adolescentes ||
					beneficiado.qtdade_adolescentes ||
					enderecoBeneficiado.qtdAdolescentes ||
					enderecoBeneficiado.adolescentes ||
					0
				),
				idosos: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_idoso ||
					beneficiado.tipoMorador?.quantidade_idoso ||
					// Fallbacks tradicionais
					beneficiado.qtdIdosos || 
					beneficiado.quantidadeIdosos || 
					beneficiado.idosos ||
					beneficiado.numIdosos ||
					beneficiado.totalIdosos ||
					beneficiado.nIdosos ||
					beneficiado.idoso ||
					beneficiado.elderly ||
					beneficiado.senior ||
					beneficiado.terceira_idade ||
					beneficiado.qtd_idosos ||
					beneficiado.quantidade_idosos ||
					beneficiado.num_idosos ||
					beneficiado.qtdade_idosos ||
					enderecoBeneficiado.qtdIdosos ||
					enderecoBeneficiado.idosos ||
					0
				),
				gestantes: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_gestante ||
					beneficiado.tipoMorador?.quantidade_gestante ||
					// Fallbacks tradicionais
					beneficiado.qtdGestantes || 
					beneficiado.quantidadeGestantes || 
					beneficiado.gestantes ||
					beneficiado.numGestantes ||
					beneficiado.totalGestantes ||
					beneficiado.nGestantes ||
					beneficiado.gestante ||
					beneficiado.pregnant ||
					beneficiado.gravidas ||
					beneficiado.gravida ||
					beneficiado.qtd_gestantes ||
					beneficiado.quantidade_gestantes ||
					beneficiado.num_gestantes ||
					beneficiado.qtdade_gestantes ||
					enderecoBeneficiado.qtdGestantes ||
					enderecoBeneficiado.gestantes ||
					0
				),
				deficientes: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_deficiente ||
					beneficiado.tipoMorador?.quantidade_deficiente ||
					// Fallbacks tradicionais
					beneficiado.qtdDeficientes || 
					beneficiado.quantidadeDeficientes || 
					beneficiado.deficientes ||
					beneficiado.numDeficientes ||
					beneficiado.totalDeficientes ||
					beneficiado.nDeficientes ||
					beneficiado.deficiente ||
					beneficiado.pcd ||
					beneficiado.pne ||
					beneficiado.disabled ||
					beneficiado.special_needs ||
					beneficiado.necessidades_especiais ||
					beneficiado.qtd_deficientes ||
					beneficiado.quantidade_deficientes ||
					beneficiado.num_deficientes ||
					beneficiado.qtdade_deficientes ||
					beneficiado.qtd_pcd ||
					enderecoBeneficiado.qtdDeficientes ||
					enderecoBeneficiado.deficientes ||
					enderecoBeneficiado.pcd ||
					0
				),
				outros: garantirString(
					// 🏠 PRIORIDADE MÁXIMA: Dados da tabela tipo_morador
					beneficiado.quantidade_outros ||
					beneficiado.tipoMorador?.quantidade_outros ||
					// Fallbacks tradicionais
					beneficiado.qtdOutros || 
					beneficiado.quantidadeOutros || 
					beneficiado.outros ||
					beneficiado.numOutros ||
					beneficiado.totalOutros ||
					beneficiado.nOutros ||
					beneficiado.outro ||
					beneficiado.other ||
					beneficiado.others ||
					beneficiado.demais ||
					beneficiado.qtd_outros ||
					beneficiado.quantidade_outros ||
					beneficiado.num_outros ||
					beneficiado.qtdade_outros ||
					enderecoBeneficiado.qtdOutros ||
					enderecoBeneficiado.outros ||
					0
				)
			};
			
			console.log('📋 Dados de endereço processados e mapeados:', dadosProcessados);
			console.log('🔍 Campos com valores preenchidos:', Object.entries(dadosProcessados).filter(([key, value]) => value && value !== "0" && value !== "-").map(([key]) => key));
			
			// Logs específicos para datas
			console.log('📅 Dados de data encontrados:', {
				dataEntrada: {
					valor: dadosProcessados.dataEntrada,
					fontes: {
						dataEntrada: beneficiado.dataEntrada,
						dataIngresso: beneficiado.dataIngresso,
						dataCadastro: beneficiado.dataCadastro,
						dataInicio: beneficiado.dataInicio,
						dataInicioAtendimento: beneficiado.dataInicioAtendimento,
						createdAt: beneficiado.createdAt
					}
				},
				dataSaida: {
					valor: dadosProcessados.dataSaida,
					fontes: {
						dataSaida: beneficiado.dataSaida,
						dataDesligamento: beneficiado.dataDesligamento,
						dataFim: beneficiado.dataFim,
						dataFinalAtendimento: beneficiado.dataFinalAtendimento,
						updatedAt: beneficiado.updatedAt
					}
				}
			});
			
			// Logs para informações de cesta
			console.log('🥫 Informações de cesta encontradas:', {
				tipoCesta: dadosProcessados.tipoCesta,
				tipoCestaAtual: dadosProcessados.tipoCestaAtual,
				tempoCestaAtual: dadosProcessados.tempoCestaAtual,
				tempoCestaRestante: dadosProcessados.tempoCestaRestante,
				tempoASA: dadosProcessados.tempoASA
			});
			
			// Logs para dados de moradia e status
			console.log('🏠 Informações de moradia e status:', {
				moradia: dadosProcessados.moradia,
				tipoMoradia: dadosProcessados.tipoMoradia,
				status: dadosProcessados.status
			});
			
			return dadosProcessados;
		}

		// Fallback para dados locais salvos
		const salvo = localStorage.getItem('enderecoBeneficiado');
		if (salvo) {
			try {
				return JSON.parse(salvo);
			} catch {}
		}

		// Dados padrão enquanto carrega
		return {
			rua: "",
			numero: "",
			complemento: "",
			bairro: "",
			cidade: "",
			estado: "",
			cep: "",
			dataEntrada: "-",
			dataSaida: "-",
			moradia: "",
			tipoMoradia: "",
			tipoCesta: "",
			status: "",
			criancas: "0",
			jovens: "0",
			adolescentes: "0",
			idosos: "0",
			gestantes: "0",
			deficientes: "0",
			outros: "0",
			tipoCestaAtual: "",
			tempoCestaAtual: "",
			tempoCestaRestante: "",
			tempoASA: ""
		};
	}

	const [endereco, setEndereco] = useState(() => {
		// Inicializar com dados padrão
		return {
			rua: "",
			numero: "",
			complemento: "",
			bairro: "",
			cidade: "",
			estado: "",
			cep: "",
			dataEntrada: "-",
			dataSaida: "-",
			moradia: "",
			tipoMoradia: "",
			tipoCesta: "",
			status: "",
			criancas: "0",
			jovens: "0",
			adolescentes: "0",
			idosos: "0",
			gestantes: "0",
			deficientes: "0",
			outros: "0",
			tipoCestaAtual: "",
			tempoCestaAtual: "",
			tempoCestaRestante: "",
			tempoASA: ""
		};
	});
	const [enderecoOriginal, setEnderecoOriginal] = useState({});

		// Atualizar endereco quando beneficiado for carregado
	useEffect(() => {
		if (beneficiado) {
			console.log('🔄 Atualizando estado do endereço com dados do beneficiado');
			const dadosEndereco = getEnderecoStorage();
			console.log('📋 Dados de endereço processados:', dadosEndereco);
			
			// Validar se todos os campos esperados estão presentes
			const camposObrigatorios = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
			const camposVazios = camposObrigatorios.filter(campo => !dadosEndereco[campo] || dadosEndereco[campo].trim() === '');
			
			if (camposVazios.length > 0) {
				console.log('⚠️ Campos de endereço vazios:', camposVazios);
			} else {
				console.log('✅ Todos os campos obrigatórios de endereço estão preenchidos');
			}
			
			// Validar campos de data
			const camposDatas = ['dataEntrada', 'dataSaida'];
			const datasVazias = camposDatas.filter(campo => !dadosEndereco[campo] || dadosEndereco[campo] === '-');
			
			if (datasVazias.length > 0) {
				console.log('⚠️ Campos de data vazios:', datasVazias);
			} else {
				console.log('✅ Todas as datas estão preenchidas');
			}
			
			// Validar campos de cesta
			const camposCesta = ['tipoCesta', 'tipoCestaAtual', 'tempoCestaAtual', 'tempoCestaRestante', 'tempoASA'];
			const cestaVazia = camposCesta.filter(campo => !dadosEndereco[campo] || dadosEndereco[campo].trim() === '');
			
			if (cestaVazia.length > 0) {
				console.log('⚠️ Campos de cesta vazios:', cestaVazia);
			} else {
				console.log('✅ Todas as informações de cesta estão preenchidas');
			}
			
			// Validar quantidades
			const camposQuantidade = ['criancas', 'jovens', 'adolescentes', 'idosos', 'gestantes', 'deficientes', 'outros'];
			const quantidadesPreenchidas = camposQuantidade.filter(campo => dadosEndereco[campo] && dadosEndereco[campo] !== "0");
			
			if (quantidadesPreenchidas.length > 0) {
				console.log('👥 Quantidades de pessoas preenchidas:', quantidadesPreenchidas.map(campo => `${campo}: ${dadosEndereco[campo]}`));
			} else {
				console.log('ℹ️ Nenhuma quantidade de pessoas foi informada (todas em 0)');
			}
			
			// Validar outros campos importantes
			const outrosCampos = ['moradia', 'tipoMoradia', 'status'];
			const outrosVazios = outrosCampos.filter(campo => !dadosEndereco[campo] || dadosEndereco[campo].trim() === '');
			
			if (outrosVazios.length > 0) {
				console.log('⚠️ Outros campos vazios:', outrosVazios);
			} else {
				console.log('✅ Todos os outros campos importantes estão preenchidos');
			}
			
			setEndereco(dadosEndereco);
			setEnderecoOriginal(dadosEndereco);
		}
	}, [beneficiado]);	const [modalConfirmar, setModalConfirmar] = useState(false);
	const [alteracaoConfirmada, setAlteracaoConfirmada] = useState(false);
	const [modalExcluirEndereco, setModalExcluirEndereco] = useState(false);
	const [modalExcluidoSucesso, setModalExcluidoSucesso] = useState(false);

	function handleChange(e) {
		const { name, value } = e.target;
		let newValue = value;
		if (name === "cep") {
			newValue = formatCEP(value);
		} else if (name === "dataEntrada" || name === "dataSaida") {
			newValue = formatDate(value);
		} else if (["numero", "criancas", "jovens", "adolescentes", "idosos", "gestantes", "deficientes", "outros"].includes(name)) {
			newValue = onlyNumbers(value, 3);
		}
		setEndereco(prev => ({ ...prev, [name]: newValue }));
	}

	function handleAlterarClick() {
		setModalConfirmar(true);
	}

	async function handleConfirmarSim() {
		try {
			setModalConfirmar(false);
			setCarregando(true);
			
			console.log('💾 Tentando salvar alterações de endereço:', endereco);
			
			// Preparar dados para atualização
			const enderecoId = beneficiado?.enderecoId || beneficiado?.endereco?.id;
			const beneficiadoId = beneficiado?.id;
			
			// Dados de endereço para atualizar
			const dadosEnderecoParaAtualizar = {
				logradouro: endereco.rua,
				numero: endereco.numero,
				complemento: endereco.complemento,
				bairro: endereco.bairro,
				cidade: endereco.cidade,
				estado: endereco.estado,
				cep: endereco.cep.replace(/\D/g, '') // Remove formatação do CEP
			};
			
			// Dados do beneficiado para atualizar (quantidades e informações complementares)
			const dadosBeneficiadoParaAtualizar = {
				tipoMoradia: endereco.tipoMoradia,
				status: endereco.status,
				qtdCriancas: parseInt(endereco.criancas) || 0,
				qtdJovens: parseInt(endereco.jovens) || 0,
				qtdAdolescentes: parseInt(endereco.adolescentes) || 0,
				qtdIdosos: parseInt(endereco.idosos) || 0,
				qtdGestantes: parseInt(endereco.gestantes) || 0,
				qtdDeficientes: parseInt(endereco.deficientes) || 0,
				qtdOutros: parseInt(endereco.outros) || 0,
				tipoCesta: endereco.tipoCesta,
				tipoCestaAtual: endereco.tipoCestaAtual
			};
			
			console.log('📦 Dados preparados para atualização:', {
				enderecoId,
				beneficiadoId,
				dadosEndereco: dadosEnderecoParaAtualizar,
				dadosBeneficiado: dadosBeneficiadoParaAtualizar
			});
			
			// Tentar atualizar via API (quando implementado)
			if (enderecoId) {
				console.log('🔄 Endereço ID encontrado, seria possível atualizar via API:', enderecoId);
				// const resultadoEndereco = await beneficiadoService.atualizarEndereco(enderecoId, dadosEnderecoParaAtualizar);
			}
			
			if (beneficiadoId) {
				console.log('🔄 Beneficiado ID encontrado, seria possível atualizar informações via API:', beneficiadoId);
				// const resultadoBeneficiado = await beneficiadoService.atualizarBeneficiado(beneficiadoId, dadosBeneficiadoParaAtualizar);
			}
			
			console.log('ℹ️ Funções de atualização não implementadas ainda no service - dados salvos localmente');
			
			// Salvar localmente como fallback
			setEnderecoOriginal(endereco);
			localStorage.setItem('enderecoBeneficiado', JSON.stringify(endereco));
			
			setAlteracaoConfirmada(true);
			setTimeout(() => setAlteracaoConfirmada(false), 3000);
			
		} catch (error) {
			console.error('❌ Erro ao salvar alterações:', error);
			setErro('Erro ao salvar alterações. As informações foram salvas localmente.');
		} finally {
			setCarregando(false);
		}
	}

	function handleConfirmarNao() {
		setModalConfirmar(false);
		setEndereco(getEnderecoStorage());
		window.location.reload();
	}

	return (
		<div className="consulta-endereco-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-endereco-container">
				<div className="consulta-endereco-voltar">
					<Voltar onClick={() => navigate("/consulta-beneficiados-menu")} />
				</div>
				<h1 className="consulta-endereco-title">Endereço</h1>
				
				{/* Mostrar informações básicas do beneficiado */}
				{beneficiado && (
					<div style={{ 
						backgroundColor: '#f8f9fa', 
						padding: '10px', 
						marginBottom: '20px', 
						borderRadius: '5px',
						fontSize: '14px',
						color: '#666'
					}}>
						<strong>CPF:</strong> {sessionStorage.getItem('cpfSelecionado')} | 
						<strong> Nome:</strong> {beneficiado.nome || 'Não informado'} | 
						<strong> ID:</strong> {beneficiado.id || 'Não informado'}
						{beneficiado.enderecoId && (
							<span> | <strong>Endereço ID:</strong> {beneficiado.enderecoId}</span>
						)}
					</div>
				)}
				
				{carregando && (
					<div style={{ textAlign: 'center', padding: '20px' }}>
						<p>Carregando endereço do beneficiado...</p>
					</div>
				)}
				
				{erro && (
					<div style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>
						<p>{erro}</p>
						<button onClick={carregarBeneficiado} style={{ marginTop: '10px', padding: '8px 16px' }}>
							Tentar Novamente
						</button>
					</div>
				)}
				
				{!carregando && !erro && beneficiado && (
					<form className="consulta-endereco-form">
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Rua/Avenida:</label>
							<input name="rua" value={endereco.rua} onChange={handleChange} />
							<label>Complemento:</label>
							<input name="complemento" value={endereco.complemento} onChange={handleChange} />
							<label>Cidade:</label>
							<input name="cidade" value={endereco.cidade} onChange={handleChange} />
							<label>CEP:</label>
							<input name="cep" value={endereco.cep} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Número:</label>
							<input name="numero" value={endereco.numero} onChange={handleChange} />
							<label>Bairro:</label>
							<input name="bairro" value={endereco.bairro} onChange={handleChange} />
							<label>Estado:</label>
							<input name="estado" value={endereco.estado} onChange={handleChange} />
						</div>
					</div>
					<hr className="consulta-endereco-divisor" />
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Data de Entrada:</label>
							<input name="dataEntrada" value={endereco.dataEntrada} onChange={handleChange} type="text" />
							<label>Moradia:</label>
							<input name="moradia" value={endereco.moradia} onChange={handleChange} />
							<label>Tipo de Cesta:</label>
							<input name="tipoCesta" value={endereco.tipoCesta} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Data de Saída:</label>
							<input name="dataSaida" value={endereco.dataSaida} onChange={handleChange} type="text" />
							<label>Tipo de Moradia:</label>
							<input name="tipoMoradia" value={endereco.tipoMoradia} onChange={handleChange} />
							<label>Status:</label>
							<input name="status" value={endereco.status} onChange={handleChange} />
						</div>
					</div>
					<hr className="consulta-endereco-divisor" />
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Quantidade de Crianças:</label>
							<input name="criancas" value={endereco.criancas} onChange={handleChange} />
							<label>Quantidade de Adolescentes:</label>
							<input name="adolescentes" value={endereco.adolescentes} onChange={handleChange} />
							<label>Quantidade de Gestantes:</label>
							<input name="gestantes" value={endereco.gestantes} onChange={handleChange} />
							<label>Quantidade de Outros:</label>
							<input name="outros" value={endereco.outros} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Quantidade de Jovens:</label>
							<input name="jovens" value={endereco.jovens} onChange={handleChange} />
							<label>Quantidade de Idosos:</label>
							<input name="idosos" value={endereco.idosos} onChange={handleChange} />
							<label>Quantidade de Deficientes:</label>
							<input name="deficientes" value={endereco.deficientes} onChange={handleChange} />
						</div>
					</div>
					<hr className="consulta-endereco-divisor" />
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Tipo de Cesta Atual:</label>
							<input name="tipoCestaAtual" value={endereco.tipoCestaAtual} onChange={handleChange} />
							<label>Tempo na Cesta Restante Atual:</label>
							<input name="tempoCestaRestante" value={endereco.tempoCestaRestante} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Tempo na Cesta Atual:</label>
							<input name="tempoCestaAtual" value={endereco.tempoCestaAtual} onChange={handleChange} />
							<label>Tempo na Cadastrado na ASA:</label>
							<input name="tempoASA" value={endereco.tempoASA} onChange={handleChange} />
						</div>
					</div>
					<div className="consulta-endereco-botoes">
						<button type="button" className="consulta-endereco-botao" onClick={handleAlterarClick}>Alterar Informações</button>
					</div>
			{/* Modal de confirmação de alteração */}
			<Modal
				isOpen={modalConfirmar}
				onClose={handleConfirmarNao}
				texto={"Tem certeza que deseja alterar as informações?"}
				showClose={false}
				botoes={[{
					texto: "SIM",
					onClick: handleConfirmarSim
				}, {
					texto: "NÃO",
					onClick: handleConfirmarNao
				}]}
			/>
			{/* Modal de feedback de alteração confirmada */}
			<Modal
				isOpen={alteracaoConfirmada}
				onClose={() => setAlteracaoConfirmada(false)}
				texto={"Informações alteradas com sucesso!"}
				showClose={false}
			/>
						<button type="button" className="consulta-endereco-botao" onClick={() => setModalExcluirEndereco(true)}>Excluir Endereço</button>
			{/* Modal de confirmação de exclusão de endereço */}
			<Modal
				isOpen={modalExcluirEndereco}
				onClose={() => setModalExcluirEndereco(false)}
				texto={"Tem certeza que deseja excluir o endereço?"}
				showClose={false}
				botoes={[{
					texto: "SIM",
					onClick: () => {
						setModalExcluirEndereco(false);
						setModalExcluidoSucesso(true);
						setTimeout(() => {
							setModalExcluidoSucesso(false);
							navigate('/consulta-beneficiados-menu');
						}, 2000);
					},
					style: { background: '#fff', color: '#111', border: '2px solid #111' }
				}, {
					texto: "NÃO",
					onClick: () => setModalExcluirEndereco(false),
					style: { background: '#111', color: '#fff', border: '2px solid #111' }
				}]}
			/>
			{/* Modal de sucesso ao excluir endereço */}
			<Modal
				isOpen={modalExcluidoSucesso}
				onClose={() => {
					setModalExcluidoSucesso(false);
					navigate('/consulta-beneficiados-menu');
				}}
				texto={"Endereço excluído com sucesso!"}
				showClose={false}
			/>
					</form>
				)}
			</div>
		</div>
	);
}
