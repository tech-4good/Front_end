import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import { beneficiadoService } from "../services/beneficiadoService";
// import { enderecoService } from "../services/enderecoService"; // TODO: Descomentar quando implementar deletar endereço (Bug 6)
import "../styles/Home.css"; 
import "../styles/ConsultaEndereco.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

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

	const onlyLettersAndSpaces = (value) => {
		// Remove caracteres que não são letras ou espaços
		let v = value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g, "");
		// Remove espaços duplos ou múltiplos
		v = v.replace(/\s+/g, " ");
		return v;
	};

	const removeDoubleSpaces = (value) => {
		// Remove apenas espaços duplos ou múltiplos, mantém todos os outros caracteres
		return value.replace(/\s+/g, " ");
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
			console.log('🏠 [ConsultaEndereco] Iniciando busca de tipo_morador');
			let tipoMoradorResponse = null;
			
			// Primeiro tentar buscar pelo CPF (método antigo)
			tipoMoradorResponse = await beneficiadoService.buscarTipoMoradorPorCpf(cpfSelecionado);
			console.log('🏠 [ConsultaEndereco] Resultado da busca por CPF:', tipoMoradorResponse);
			
			// Se não encontrou por CPF e temos um endereço, tentar buscar pelo endereço
			if (!tipoMoradorResponse.success && response.data?.endereco) {
				const enderecoId = response.data.endereco.idEndereco || response.data.endereco.id;
				console.log('🏠 [ConsultaEndereco] Tentando buscar por endereço ID:', enderecoId);
				tipoMoradorResponse = await beneficiadoService.buscarTipoMoradorPorEndereco(enderecoId);
				console.log('🏠 [ConsultaEndereco] Resultado da busca por endereço:', tipoMoradorResponse);
			}
			
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
						// Mapear campos de quantidade (backend usa camelCase)
						quantidade_crianca: tipoMoradorResponse.data.quantidadeCrianca || 0,
						quantidade_adolescente: tipoMoradorResponse.data.quantidadeAdolescente || 0,
						quantidade_jovem: tipoMoradorResponse.data.quantidadeJovem || 0,
						quantidade_idoso: tipoMoradorResponse.data.quantidadeIdoso || 0,
						quantidade_gestante: tipoMoradorResponse.data.quantidadeGestante || 0,
						quantidade_deficiente: tipoMoradorResponse.data.quantidadeDeficiente || 0,
						quantidade_outros: tipoMoradorResponse.data.quantidadeOutros || 0,
						// Manter compatibilidade com nomes alternativos
						qtdCriancas: tipoMoradorResponse.data.quantidadeCrianca || 0,
						qtdAdolescentes: tipoMoradorResponse.data.quantidadeAdolescente || 0,
						qtdJovens: tipoMoradorResponse.data.quantidadeJovem || 0,
						qtdIdosos: tipoMoradorResponse.data.quantidadeIdoso || 0,
						qtdGestantes: tipoMoradorResponse.data.quantidadeGestante || 0,
						qtdDeficientes: tipoMoradorResponse.data.quantidadeDeficiente || 0,
						qtdOutros: tipoMoradorResponse.data.quantidadeOutros || 0
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
				cep: formatCEP(enderecoBeneficiado.cep || enderecoBeneficiado.endereco?.cep || ""),
				
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
	// TODO: Descomentar quando implementar deletar endereço (Bug 6)
	// const [modalExcluirEndereco, setModalExcluirEndereco] = useState(false);
	// const [modalExcluidoSucesso, setModalExcluidoSucesso] = useState(false);
	// const [modalErroExclusao, setModalErroExclusao] = useState(false);

	function handleChange(e) {
		const { name, value } = e.target;
		let newValue = value;
		if (name === "cep") {
			newValue = formatCEP(value);
		} else if (name === "dataEntrada" || name === "dataSaida") {
			newValue = formatDate(value);
		} else if (name === "numero") {
			newValue = onlyNumbers(value, 5);
		} else if (["rua", "bairro", "cidade", "estado", "moradia", "tipoMoradia", "tipoCesta", "status"].includes(name)) {
			newValue = onlyLettersAndSpaces(value);
		} else if (name === "complemento") {
			newValue = removeDoubleSpaces(value);
		} else if (["criancas", "jovens", "adolescentes", "idosos", "gestantes", "deficientes", "outros"].includes(name)) {
			newValue = onlyNumbers(value, 2);
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
			setErro(null);
			
			console.log('💾 Tentando salvar alterações de endereço:', endereco);
			console.log('📋 Beneficiado completo:', beneficiado);
			console.log('🔍 Investigando estrutura do beneficiado:', {
				temEnderecoId: !!beneficiado?.enderecoId,
				enderecoId: beneficiado?.enderecoId,
				temEndereco: !!beneficiado?.endereco,
				endereco: beneficiado?.endereco,
				todasAsChaves: beneficiado ? Object.keys(beneficiado) : [],
				chavesEndereco: beneficiado?.endereco ? Object.keys(beneficiado.endereco) : []
			});
			
			// Preparar dados para atualização
			let enderecoId = beneficiado?.enderecoId || 
							 beneficiado?.endereco?.idEndereco || 
							 beneficiado?.endereco?.id;
			
			// Se ainda não encontrou, tentar buscar o endereço pelo CPF
			if (!enderecoId && beneficiado?.cpf) {
				console.log('🔍 Tentando buscar endereço pelo CPF do beneficiado...');
				try {
					const enderecosResponse = await beneficiadoService.buscarEnderecos();
					if (enderecosResponse.success && enderecosResponse.data) {
						// Procurar um endereço que tenha os mesmos dados
						const enderecoEncontrado = enderecosResponse.data.find(e => 
							e.logradouro === endereco.rua && 
							e.numero === endereco.numero
						);
						
						if (enderecoEncontrado) {
							enderecoId = enderecoEncontrado.id || enderecoEncontrado.idEndereco;
							console.log('✅ Endereço encontrado por comparação:', enderecoId);
						}
					}
				} catch (buscaError) {
					console.log('⚠️ Erro ao buscar lista de endereços:', buscaError);
				}
			}
			
			const beneficiadoId = beneficiado?.id;
			
			console.log('🔑 IDs encontrados:', { enderecoId, beneficiadoId });
			
			if (!enderecoId) {
				const mensagemErro = 'ID do endereço não encontrado. Estrutura do beneficiado: ' + JSON.stringify({
					enderecoId: beneficiado?.enderecoId,
					endereco: beneficiado?.endereco,
					todasAsChaves: beneficiado ? Object.keys(beneficiado) : []
				}, null, 2);
				console.error('❌ ' + mensagemErro);
				throw new Error('ID do endereço não encontrado. Não é possível atualizar. Verifique o console para mais detalhes.');
			}
			
			// 📝 Detectar apenas campos ALTERADOS do endereço (PATCH parcial)
			const enderecoOriginalData = beneficiado?.endereco || enderecoOriginal;
			const dadosEnderecoParaAtualizar = {};
			
			console.log('🔍 DEBUG - Comparação de valores:');
			console.log('  Formulário numero:', endereco.numero, `(tipo: ${typeof endereco.numero})`);
			console.log('  Original numero:', enderecoOriginalData?.numero, `(tipo: ${typeof enderecoOriginalData?.numero})`);
			console.log('  São diferentes?:', endereco.numero !== enderecoOriginalData?.numero);
			
			if (endereco.rua !== enderecoOriginalData?.logradouro) {
				dadosEnderecoParaAtualizar.logradouro = endereco.rua;
			}
			if (endereco.numero !== enderecoOriginalData?.numero) {
				dadosEnderecoParaAtualizar.numero = endereco.numero;
				console.log('✏️ Número será atualizado de', enderecoOriginalData?.numero, 'para', endereco.numero);
			}
			if (endereco.complemento !== enderecoOriginalData?.complemento) {
				dadosEnderecoParaAtualizar.complemento = endereco.complemento;
			}
			if (endereco.bairro !== enderecoOriginalData?.bairro) {
				dadosEnderecoParaAtualizar.bairro = endereco.bairro;
			}
			if (endereco.cidade !== enderecoOriginalData?.cidade) {
				dadosEnderecoParaAtualizar.cidade = endereco.cidade;
			}
			if (endereco.estado !== enderecoOriginalData?.estado) {
				dadosEnderecoParaAtualizar.estado = endereco.estado;
			}
			const cepLimpo = endereco.cep.replace(/\D/g, '');
			if (cepLimpo !== enderecoOriginalData?.cep?.replace(/\D/g, '')) {
				dadosEnderecoParaAtualizar.cep = cepLimpo;
			}
			
			// 📅 Campos de DATA, MORADIA, CESTA e STATUS (pertencem à tabela ENDERECOS)
			if (endereco.dataEntrada && endereco.dataEntrada.dia && endereco.dataEntrada.mes && endereco.dataEntrada.ano) {
				const dataEntradaFormatada = `${endereco.dataEntrada.ano}-${endereco.dataEntrada.mes.toString().padStart(2, '0')}-${endereco.dataEntrada.dia.toString().padStart(2, '0')}`;
				const dataOriginal = enderecoOriginalData?.dataEntrada;
				const dataOriginalFormatada = dataOriginal ? `${dataOriginal[0]}-${dataOriginal[1].toString().padStart(2, '0')}-${dataOriginal[2].toString().padStart(2, '0')}` : null;
				
				if (dataEntradaFormatada !== dataOriginalFormatada) {
					dadosEnderecoParaAtualizar.dataEntrada = dataEntradaFormatada;
				}
			}
			
			if (endereco.dataSaida && endereco.dataSaida.dia && endereco.dataSaida.mes && endereco.dataSaida.ano) {
				const dataSaidaFormatada = `${endereco.dataSaida.ano}-${endereco.dataSaida.mes.toString().padStart(2, '0')}-${endereco.dataSaida.dia.toString().padStart(2, '0')}`;
				const dataOriginal = enderecoOriginalData?.dataSaida;
				const dataOriginalFormatada = dataOriginal ? `${dataOriginal[0]}-${dataOriginal[1].toString().padStart(2, '0')}-${dataOriginal[2].toString().padStart(2, '0')}` : null;
				
				if (dataSaidaFormatada !== dataOriginalFormatada) {
					dadosEnderecoParaAtualizar.dataSaida = dataSaidaFormatada;
				}
			}
			
			if (endereco.moradia !== enderecoOriginalData?.moradia) {
				dadosEnderecoParaAtualizar.moradia = endereco.moradia;
			}
			if (endereco.tipoMoradia !== enderecoOriginalData?.tipoMoradia) {
				// Backend espera TipoMoradia em MAIÚSCULO (ex: CASA, APARTAMENTO)
				dadosEnderecoParaAtualizar.tipoMoradia = endereco.tipoMoradia?.toUpperCase();
			}
			if (endereco.tipoCesta !== enderecoOriginalData?.tipoCesta) {
				// Backend espera TipoCesta em MAIÚSCULO (ex: BASICA, KIT, ESPECIAL)
				dadosEnderecoParaAtualizar.tipoCesta = endereco.tipoCesta?.toUpperCase();
			}
			if (endereco.status !== enderecoOriginalData?.status) {
				// Backend espera Status em MAIÚSCULO (ex: ABERTO, FECHADO)
				// Converter "Ativo" → "ABERTO", "Inativo" → "FECHADO"
				let statusBackend = endereco.status?.toUpperCase();
				if (statusBackend === 'ATIVO') statusBackend = 'ABERTO';
				if (statusBackend === 'INATIVO') statusBackend = 'FECHADO';
				dadosEnderecoParaAtualizar.status = statusBackend;
			}
			
			console.log('📝 Campos de endereço alterados:', Object.keys(dadosEnderecoParaAtualizar));
			
			// Se nenhum campo de endereço foi alterado, não enviar PATCH de endereço
			const temAlteracaoEndereco = Object.keys(dadosEnderecoParaAtualizar).length > 0;
			
			// 📊 Dados de TIPO_MORADOR para atualizar (APENAS quantidades de pessoas)
			const dadosTipoMoradorParaAtualizar = {
				quantidadeCrianca: parseInt(endereco.quantidade_crianca) || 0,
				quantidadeJovem: parseInt(endereco.quantidade_jovem) || 0,
				quantidadeAdolescente: parseInt(endereco.quantidade_adolescente) || 0,
				quantidadeIdoso: parseInt(endereco.quantidade_idoso) || 0,
				quantidadeGestante: parseInt(endereco.quantidade_gestante) || 0,
				quantidadeDeficiente: parseInt(endereco.quantidade_deficiente) || 0,
				quantidadeOutros: parseInt(endereco.quantidade_outros) || 0
			};
			
			console.log('📦 Dados preparados para atualização:', {
				enderecoId,
				beneficiadoId,
				dadosEndereco: dadosEnderecoParaAtualizar,
				dadosTipoMorador: dadosTipoMoradorParaAtualizar,
				temAlteracaoEndereco
			});
			
			// ✅ Atualizar endereço APENAS se houver alterações
			if (temAlteracaoEndereco) {
				console.log('🔄 Atualizando endereço via API - ID:', enderecoId);
				console.log('📤 Payload do endereço (PATCH parcial):', dadosEnderecoParaAtualizar);
				
				const { enderecoService } = await import('../services/enderecoService');
				const resultadoEndereco = await enderecoService.atualizarEndereco(enderecoId, dadosEnderecoParaAtualizar);
				
				console.log('📥 Resposta da API de endereço:', resultadoEndereco);
				
				if (resultadoEndereco.success) {
					console.log('✅ Endereço atualizado com sucesso no banco:', resultadoEndereco.data);
				} else {
					throw new Error('Erro ao atualizar endereço: ' + (resultadoEndereco.error || 'Erro desconhecido'));
				}
			} else {
				console.log('ℹ️ Nenhuma alteração de endereço detectada - pulando PATCH de endereço');
			}
			
			// 📊 Atualizar TIPO_MORADOR (quantidades de pessoas)
			// Buscar ID do tipo_morador
			console.log('🔍 Buscando ID do tipo_morador para beneficiado:', beneficiadoId);
			
			const tipoMoradorService = (await import('../services/tipoMoradorService')).default;
			const tipoMoradorResponse = await tipoMoradorService.buscarPorBeneficiado(beneficiadoId);
			
			if (tipoMoradorResponse.success && tipoMoradorResponse.data) {
				const tipoMoradorId = tipoMoradorResponse.data.idTipoMorador;
				console.log('✅ Tipo Morador encontrado - ID:', tipoMoradorId);
				
				console.log('🔄 Atualizando tipo_morador via API - ID:', tipoMoradorId);
				console.log('📤 Payload do tipo_morador:', dadosTipoMoradorParaAtualizar);
				
				const resultadoTipoMorador = await tipoMoradorService.atualizar(tipoMoradorId, dadosTipoMoradorParaAtualizar);
				
				console.log('📥 Resposta da API de tipo_morador:', resultadoTipoMorador);
				
				if (resultadoTipoMorador.success) {
					console.log('✅ Tipo Morador atualizado com sucesso:', resultadoTipoMorador.data);
				} else {
					console.warn('⚠️ Erro ao atualizar tipo_morador:', resultadoTipoMorador.error);
					// Não falha a operação toda se tipo_morador falhar
				}
			} else {
				console.warn('⚠️ Tipo Morador não encontrado para este beneficiado');
				console.warn('   As quantidades de pessoas não serão atualizadas');
			}
			
			// Atualizar dados do beneficiado se necessário (campos básicos)
			if (beneficiadoId) {
				// O beneficiado não precisa mais receber tipoMoradia, status, qtd* pois vão para outras tabelas
				console.log('ℹ️ Beneficiado não precisa de atualização adicional (campos já atualizados em endereço e tipo_morador)');
			}
			
			// Recarregar dados do beneficiado após atualização
			console.log('🔄 Recarregando dados do beneficiado...');
			await carregarBeneficiado();
			
			// Salvar localmente como backup
			setEnderecoOriginal(endereco);
			localStorage.setItem('enderecoBeneficiado', JSON.stringify(endereco));
			
			setAlteracaoConfirmada(true);
			setTimeout(() => setAlteracaoConfirmada(false), 3000);
			
		} catch (error) {
			console.error('❌ ERRO COMPLETO ao salvar alterações:', error);
			console.error('❌ Stack trace:', error.stack);
			console.error('❌ Mensagem:', error.message);
			setErro(`Erro ao salvar: ${error.message}`);
		} finally {
			setCarregando(false);
		}
	}

	function handleConfirmarNao() {
		setModalConfirmar(false);
		setEndereco(getEnderecoStorage());
		window.location.reload();
	}

	// TODO: Descomentar quando implementar deletar endereço (Bug 6)
	// Referência: Ver README_PROBLEMA_FK_ENDERECOS.md para soluções possíveis sobre FK constraints
	/*
	async function handleExcluirEndereco() {
		setModalExcluirEndereco(false);
		setCarregando(true);
		
		try {
			// Buscar ID do endereço
			const enderecoId = beneficiado?.enderecoId || 
							   beneficiado?.endereco?.idEndereco || 
							   beneficiado?.endereco?.id;
			
			if (!enderecoId) {
				console.error("❌ ID do endereço não encontrado");
				setErro("Erro: ID do endereço não encontrado");
				setCarregando(false);
				return;
			}
			
			console.log("🗑️ Deletando endereço ID:", enderecoId);
			const response = await enderecoService.deletarEndereco(enderecoId);
			
			if (response.success) {
				console.log("✅ Endereço deletado com sucesso!");
				setModalExcluidoSucesso(true);
				// Aguarda 2s antes de redirecionar (UX)
				setTimeout(() => {
					setModalExcluidoSucesso(false);
					navigate('/cadastro-beneficiado-menu');
				}, 2000);
			} else {
				console.error("❌ Erro ao deletar endereço:", response.error);
				setErro(response.error || "Erro ao deletar endereço");
			}
		} catch (error) {
			console.error("❌ Erro inesperado ao deletar endereço:", error);
			
			// Detectar erro de constraint (foreign key)
			if (error.message && error.message.includes('foreign key constraint')) {
				setModalErroExclusao(true);
			} else if (error.message && error.message.includes('Unauthorized')) {
				// Redirecionar para login se sessão expirou
				setErro("Sessão expirada. Redirecionando para login...");
				setTimeout(() => navigate('/'), 2000);
			} else if (error.message && error.message.includes('Not Found')) {
				// Endereço já foi deletado - atualizar página
				setErro("Este endereço já foi deletado. Atualizando...");
				setTimeout(() => navigate('/cadastro-beneficiado-menu'), 2000);
			} else {
				setErro(error.message || "Erro inesperado ao excluir endereço");
			}
		} finally {
			setCarregando(false);
		}
	}
	*/

	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isConsultaBeneficiadosPage={true} />
			<div className="consulta-endereco-container">
				<img 
					src={iconeVoltar} 
					alt="Voltar" 
					className="consulta-endereco-icone-voltar"
					onClick={() => navigate("/consulta-beneficiados-menu")}
				/>
				<h1 className="consulta-endereco-title">Endereço</h1>
				
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
					<>
						<form className="consulta-endereco-form" onSubmit={(e) => { e.preventDefault(); handleAlterarClick(); }}>
							{/* Primeira linha - Rua, Número, Complemento */}
							<div className="consulta-endereco-row consulta-endereco-row-triple">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Rua/Avenida:</label>
									<input
										type="text"
										name="rua"
										value={endereco.rua}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Insira a rua/avenida"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Número:</label>
									<input
										type="text"
										name="numero"
										value={endereco.numero}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Ex: 67, 678, 1234"
										maxLength={10}
										title="Número do endereço"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Complemento:</label>
									<input
										type="text"
										name="complemento"
										value={endereco.complemento}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Complemento"
									/>
								</div>
							</div>

							{/* Segunda linha - Bairro, Cidade, Estado */}
							<div className="consulta-endereco-row consulta-endereco-row-triple">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Bairro:</label>
									<input
										type="text"
										name="bairro"
										value={endereco.bairro}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Bairro"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Cidade:</label>
									<input
										type="text"
										name="cidade"
										value={endereco.cidade}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Cidade"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Estado:</label>
									<input
										type="text"
										name="estado"
										value={endereco.estado}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Estado"
									/>
								</div>
							</div>

							{/* Terceira linha - CEP (campo único) */}
							<div className="consulta-endereco-row consulta-endereco-row-single">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">CEP:</label>
									<input
										type="text"
										name="cep"
										value={endereco.cep}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="00000-000"
										maxLength={9}
									/>
								</div>
							</div>

							<div className="consulta-endereco-divisor"></div>

							{/* Quarta linha - Data de Entrada, Data de Saída, Moradia */}
							<div className="consulta-endereco-row consulta-endereco-row-triple">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Data de Entrada:</label>
									<input
										type="text"
										name="dataEntrada"
										value={endereco.dataEntrada}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="dd/mm/aaaa"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Data de Saída:</label>
									<input
										type="text"
										name="dataSaida"
										value={endereco.dataSaida}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="dd/mm/aaaa"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Moradia:</label>
									<input
										type="text"
										name="moradia"
										value={endereco.moradia}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Tipo de moradia"
									/>
								</div>
							</div>

							{/* Quinta linha - Tipo de Moradia, Tipo de Cesta, Status */}
							<div className="consulta-endereco-row consulta-endereco-row-triple">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Tipo de Moradia:</label>
									<input
										type="text"
										name="tipoMoradia"
										value={endereco.tipoMoradia}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Ex: Casa, Apartamento"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Tipo de Cesta:</label>
									<input
										type="text"
										name="tipoCesta"
										value={endereco.tipoCesta}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Tipo de cesta"
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Status:</label>
									<input
										type="text"
										name="status"
										value={endereco.status}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Status"
									/>
								</div>
							</div>

							<div className="consulta-endereco-divisor"></div>

							{/* Sexta linha - Quantidade de Crianças, Jovens, Adolescentes */}
							<div className="consulta-endereco-row consulta-endereco-row-triple">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Crianças:</label>
									<input
										type="text"
										name="criancas"
										value={endereco.criancas}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Jovens:</label>
									<input
										type="text"
										name="jovens"
										value={endereco.jovens}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Adolescentes:</label>
									<input
										type="text"
										name="adolescentes"
										value={endereco.adolescentes}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
							</div>

							{/* Sétima linha - Quantidade de Idosos, Gestantes, Deficientes */}
							<div className="consulta-endereco-row consulta-endereco-row-triple">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Idosos:</label>
									<input
										type="text"
										name="idosos"
										value={endereco.idosos}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Gestantes:</label>
									<input
										type="text"
										name="gestantes"
										value={endereco.gestantes}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Deficientes:</label>
									<input
										type="text"
										name="deficientes"
										value={endereco.deficientes}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
							</div>

							{/* Oitava linha - Quantidade de Outros (campo único) */}
							<div className="consulta-endereco-row consulta-endereco-row-single">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Quantidade de Outros:</label>
									<input
										type="text"
										name="outros"
										value={endereco.outros}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="0"
										maxLength={2}
									/>
								</div>
							</div>

							<div className="consulta-endereco-divisor"></div>

							{/* Nona linha - Tipo de Cesta Atual, Tempo na Cesta Atual */}
							<div className="consulta-endereco-row consulta-endereco-row-double">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Tipo de Cesta Atual:</label>
									<input
										type="text"
										name="tipoCestaAtual"
										value={endereco.tipoCestaAtual}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Tipo de cesta atual"
										readOnly
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Tempo na Cesta Atual:</label>
									<input
										type="text"
										name="tempoCestaAtual"
										value={endereco.tempoCestaAtual}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Tempo"
										readOnly
									/>
								</div>
							</div>

							{/* Décima linha - Tempo Restante na Cesta, Tempo Cadastrado na ASA */}
							<div className="consulta-endereco-row consulta-endereco-row-double">
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Tempo Restante na Cesta:</label>
									<input
										type="text"
										name="tempoCestaRestante"
										value={endereco.tempoCestaRestante}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Tempo restante"
										readOnly
									/>
								</div>
								<div className="consulta-endereco-field">
									<label className="consulta-endereco-label">Tempo Cadastrado na ASA:</label>
									<input
										type="text"
										name="tempoASA"
										value={endereco.tempoASA}
										onChange={handleChange}
										className="consulta-endereco-input"
										placeholder="Tempo na ASA"
										readOnly
									/>
								</div>
							</div>


						<div className="consulta-endereco-botoes">
							<button 
								type="submit" 
								className="consulta-endereco-botao"
								disabled={carregando}
							>
								{carregando ? 'Salvando...' : 'Alterar Informações'}
							</button>
							{/* TODO: Descomentar quando implementar deletar endereço (Bug 6) */}
							{/* Referência: Ver README_PROBLEMA_FK_ENDERECOS.md para soluções sobre FK constraints */}
							{/*
							<button
								type="button"
								className="consulta-endereco-botao-danger"
								onClick={() => setModalExcluirEndereco(true)}
								disabled={carregando}
								title="⚠️ ATENÇÃO: Endereços com registros vinculados (beneficiados, tipo_morador, filhos) não podem ser deletados. Delete os registros vinculados primeiro."
							>
								{carregando ? 'Processando...' : '🗑️ Excluir Endereço'}
							</button>
							*/}
						</div>
					</form>
					</>
				)}				{/* Modal de confirmação de alteração */}
				<Modal
					isOpen={modalConfirmar}
					onClose={handleConfirmarNao}
					texto={"Tem certeza que deseja alterar as informações?"}
					showClose={false}
					botoes={[
						{
							texto: "Sim",
							onClick: handleConfirmarSim,
						},
						{
							texto: "Não",
							onClick: handleConfirmarNao,
						},
					]}
				/>

				{/* TODO: Descomentar quando implementar deletar endereço (Bug 6) */}
				{/* Referência: Ver README_PROBLEMA_FK_ENDERECOS.md para entender o problema de FK constraints */}
				{/*
				<Modal
					isOpen={modalExcluirEndereco}
					onClose={() => setModalExcluirEndereco(false)}
					texto={
						"⚠️ Confirmar Exclusão de Endereço\n\n" +
						"Você está prestes a deletar permanentemente:\n" +
						`• ${endereco.rua || endereco.logradouro}, ${endereco.numero}\n` +
						`• ${endereco.bairro} - ${endereco.cidade}/${endereco.estado}\n` +
						`• CEP: ${endereco.cep}\n\n` +
						"⚠️ ATENÇÃO: Esta ação NÃO pode ser desfeita!"
					}
					showClose={false}
					botoes={[
						{
							texto: "Cancelar",
							onClick: () => setModalExcluirEndereco(false),
							style: {
								background: "#fff",
								color: "#111",
								border: "2px solid #ccc",
								minWidth: 120,
								minHeight: 44,
								fontSize: 16
							},
						},
						{
							texto: "❌ Confirmar Exclusão",
							onClick: handleExcluirEndereco,
							style: {
								background: "#d32f2f",
								color: "#fff",
								border: "2px solid #d32f2f",
								minWidth: 120,
								minHeight: 44,
								fontSize: 16,
								fontWeight: "bold"
							},
						},
					]}
				/>

				<Modal
					isOpen={modalExcluidoSucesso}
					onClose={() => {
						setModalExcluidoSucesso(false);
						navigate('/consulta-beneficiado-menu');
					}}
					texto={"Endereço excluído com sucesso!"}
					showClose={false}
				/>

				<Modal
					isOpen={modalErroExclusao}
					onClose={() => setModalErroExclusao(false)}
					texto={
						"⚠️ Não é Possível Deletar Este Endereço\n\n" +
						"❌ Existem registros vinculados a este endereço:\n" +
						"• Beneficiados\n" +
						"• Tipo de Morador\n" +
						"• Filhos\n\n" +
						"📋 Para deletar o endereço, você deve primeiro:\n\n" +
						"1️⃣ Remover ou alterar o endereço de todos os beneficiados vinculados\n" +
						"2️⃣ Ou excluir os beneficiados que utilizam este endereço\n\n" +
						"💡 Dica: Você pode apenas atualizar as informações do endereço sem excluí-lo."
					}
					showClose={true}
					botoes={[
						{
							texto: "Entendi",
							onClick: () => setModalErroExclusao(false),
							style: {
								background: "#111",
								color: "#fff",
								border: "2px solid #111",
								minWidth: 120,
								minHeight: 44,
								fontSize: 16
							}
						}
					]}
				/>
				*/}

				{/* Modal de feedback de alteração confirmada */}
				<Modal
					isOpen={alteracaoConfirmada}
					onClose={() => setAlteracaoConfirmada(false)}
					texto={"Informações alteradas com sucesso!"}
					showClose={false}
				/>
			</div>
		</div>
	);
}
