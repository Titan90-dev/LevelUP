import { useEffect, useMemo, useState } from "react";
import "./App.css";

const categorias = [
  { nome: "Todas", emoji: "📋" },
  { nome: "Saúde", emoji: "❤️" },
  { nome: "Estudos", emoji: "📚" },
  { nome: "Exercícios", emoji: "🏃" },
  { nome: "Organização", emoji: "🧹" },
  { nome: "Bem-estar", emoji: "🧘" },
  { nome: "Outros", emoji: "⭐" },
];

const categoriasAtividade = categorias.filter(
  (categoria) => categoria.nome !== "Todas",
);

const obterDataAtual = () => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
};

const formatarData = (data) => {
  const [ano, mes, dia] = data.split("-");

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const obterNomeDia = (data) => {
  const [ano, mes, dia] = data.split("-");

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
  )
    .toLocaleDateString("pt-BR", {
      weekday: "short",
    })
    .replace(".", "");
};

const gerarUltimosDias = (quantidade) => {
  const hoje = new Date();
  const dias = [];

  for (let i = quantidade - 1; i >= 0; i -= 1) {
    const data = new Date(hoje);

    data.setHours(12, 0, 0, 0);
    data.setDate(hoje.getDate() - i);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    dias.push(`${ano}-${mes}-${dia}`);
  }

  return dias;
};

const obterCategoria = (nome) => {
  return (
    categoriasAtividade.find(
      (categoria) => categoria.nome === nome,
    ) || categoriasAtividade[categoriasAtividade.length - 1]
  );
};

function App() {
  const [atividades, setAtividades] = useState(() => {
    const salvas = localStorage.getItem("atividades");

    if (salvas) {
      return JSON.parse(salvas);
    }

    return [
      {
        id: crypto.randomUUID(),
        nome: "Beber água",
        categoria: "Saúde",
        xp: 10,
        concluida: false,
      },
      {
        id: crypto.randomUUID(),
        nome: "Ler 10 páginas",
        categoria: "Estudos",
        xp: 15,
        concluida: false,
      },
    ];
  });

  const [xpTotal, setXpTotal] = useState(() => {
    return Number(localStorage.getItem("xpTotal")) || 0;
  });

  const [sequencia, setSequencia] = useState(() => {
    return Number(localStorage.getItem("sequencia")) || 0;
  });

  const [ultimoDiaAtivo, setUltimoDiaAtivo] = useState(() => {
    return localStorage.getItem("ultimoDiaAtivo") || "";
  });

  const [historico, setHistorico] = useState(() => {
    const salvo = localStorage.getItem("historico");
    return salvo ? JSON.parse(salvo) : {};
  });

  const [nomeNovaAtividade, setNomeNovaAtividade] =
    useState("");

  const [categoriaNovaAtividade, setCategoriaNovaAtividade] =
    useState("Saúde");

  const [xpNovaAtividade, setXpNovaAtividade] =
    useState("10");

  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Todas");

  const [atividadeEditando, setAtividadeEditando] =
    useState(null);

  const [nomeEditado, setNomeEditado] = useState("");

  const [categoriaEditada, setCategoriaEditada] =
    useState("Saúde");

  const [xpEditado, setXpEditado] = useState("10");

  const dataAtual = obterDataAtual();

  const atividadesFiltradas = useMemo(() => {
    if (categoriaSelecionada === "Todas") {
      return atividades;
    }

    return atividades.filter(
      (atividade) =>
        atividade.categoria === categoriaSelecionada,
    );
  }, [atividades, categoriaSelecionada]);

  const atividadesConcluidas = atividades.filter(
    (atividade) => atividade.concluida,
  );

  const xpHoje = atividadesConcluidas.reduce(
    (total, atividade) => total + Number(atividade.xp),
    0,
  );

  const progressoHoje =
    atividades.length > 0
      ? Math.round(
          (atividadesConcluidas.length / atividades.length) * 100,
        )
      : 0;

  const nivel = Math.floor(xpTotal / 100) + 1;
  const xpNoNivel = xpTotal % 100;
  const diasDoCalendario = gerarUltimosDias(30);

  useEffect(() => {
    localStorage.setItem(
      "atividades",
      JSON.stringify(atividades),
    );
  }, [atividades]);

  useEffect(() => {
    localStorage.setItem("xpTotal", String(xpTotal));
  }, [xpTotal]);

  useEffect(() => {
    localStorage.setItem("sequencia", String(sequencia));
  }, [sequencia]);

  useEffect(() => {
    if (ultimoDiaAtivo) {
      localStorage.setItem("ultimoDiaAtivo", ultimoDiaAtivo);
    }
  }, [ultimoDiaAtivo]);

  useEffect(() => {
    localStorage.setItem(
      "historico",
      JSON.stringify(historico),
    );
  }, [historico]);

  useEffect(() => {
    const ultimaDataSalva =
      localStorage.getItem("dataAtual");

    if (ultimaDataSalva !== dataAtual) {
      setAtividades((atividadesAtuais) =>
        atividadesAtuais.map((atividade) => ({
          ...atividade,
          concluida: false,
        })),
      );

      localStorage.setItem("dataAtual", dataAtual);
    }
  }, [dataAtual]);

  const salvarHistoricoDoDia = (atividadesAtualizadas) => {
    const concluidas = atividadesAtualizadas.filter(
      (atividade) => atividade.concluida,
    );

    const xpDoDia = concluidas.reduce(
      (total, atividade) => total + Number(atividade.xp),
      0,
    );

    const progresso =
      atividadesAtualizadas.length > 0
        ? Math.round(
            (concluidas.length /
              atividadesAtualizadas.length) *
              100,
          )
        : 0;

    setHistorico((historicoAtual) => ({
      ...historicoAtual,
      [dataAtual]: {
        progresso,
        xp: xpDoDia,
        concluidas: concluidas.length,
        total: atividadesAtualizadas.length,
        concluido:
          progresso === 100 &&
          atividadesAtualizadas.length > 0,
      },
    }));
  };

  const alternarAtividade = (id) => {
    const atividadeAlterada = atividades.find(
      (atividade) => atividade.id === id,
    );

    if (!atividadeAlterada) {
      return;
    }

    const novaConclusao = !atividadeAlterada.concluida;

    const atividadesAtualizadas = atividades.map(
      (atividade) =>
        atividade.id === id
          ? {
              ...atividade,
              concluida: novaConclusao,
            }
          : atividade,
    );

    setAtividades(atividadesAtualizadas);
    salvarHistoricoDoDia(atividadesAtualizadas);

    if (novaConclusao) {
      setXpTotal(
        (xpAtual) =>
          xpAtual + Number(atividadeAlterada.xp),
      );

      if (atividadesConcluidas.length === 0) {
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);

        const ano = ontem.getFullYear();
        const mes = String(
          ontem.getMonth() + 1,
        ).padStart(2, "0");
        const dia = String(ontem.getDate()).padStart(2, "0");

        const dataOntem = `${ano}-${mes}-${dia}`;

        if (ultimoDiaAtivo === dataOntem) {
          setSequencia((valor) => valor + 1);
        } else if (ultimoDiaAtivo !== dataAtual) {
          setSequencia(1);
        }

        setUltimoDiaAtivo(dataAtual);
      }
    } else {
      setXpTotal((xpAtual) =>
        Math.max(
          0,
          xpAtual - Number(atividadeAlterada.xp),
        ),
      );
    }
  };

  const adicionarAtividade = (evento) => {
    evento.preventDefault();

    const nome = nomeNovaAtividade.trim();
    const xp = Number(xpNovaAtividade);

    if (!nome) {
      window.alert("Digite um nome para a atividade.");
      return;
    }

    if (!Number.isFinite(xp) || xp < 0) {
      window.alert("Digite um valor de XP válido.");
      return;
    }

    const novaAtividade = {
      id: crypto.randomUUID(),
      nome,
      categoria: categoriaNovaAtividade,
      xp,
      concluida: false,
    };

    setAtividades((atividadesAtuais) => [
      ...atividadesAtuais,
      novaAtividade,
    ]);

    setNomeNovaAtividade("");
    setXpNovaAtividade("10");
  };

  const iniciarEdicao = (atividade) => {
    setAtividadeEditando(atividade.id);
    setNomeEditado(atividade.nome);
    setCategoriaEditada(atividade.categoria);
    setXpEditado(String(atividade.xp));
  };

  const cancelarEdicao = () => {
    setAtividadeEditando(null);
    setNomeEditado("");
    setCategoriaEditada("Saúde");
    setXpEditado("10");
  };

  const salvarEdicao = (evento, id) => {
    evento.preventDefault();

    const nome = nomeEditado.trim();
    const novoXp = Number(xpEditado);

    if (!nome) {
      window.alert("Digite um nome para a atividade.");
      return;
    }

    if (!Number.isFinite(novoXp) || novoXp < 0) {
      window.alert("Digite um valor de XP válido.");
      return;
    }

    const atividadeAtual = atividades.find(
      (atividade) => atividade.id === id,
    );

    if (!atividadeAtual) {
      return;
    }

    const atividadesAtualizadas = atividades.map(
      (atividade) =>
        atividade.id === id
          ? {
              ...atividade,
              nome,
              categoria: categoriaEditada,
              xp: novoXp,
            }
          : atividade,
    );

    setAtividades(atividadesAtualizadas);

    if (atividadeAtual.concluida) {
      const diferencaXp =
        novoXp - Number(atividadeAtual.xp);

      setXpTotal((xpAtual) =>
        Math.max(0, xpAtual + diferencaXp),
      );

      setHistorico((historicoAtual) => {
        const registroAtual = historicoAtual[dataAtual];

        if (!registroAtual) {
          return historicoAtual;
        }

        return {
          ...historicoAtual,
          [dataAtual]: {
            ...registroAtual,
            xp: Math.max(
              0,
              Number(registroAtual.xp || 0) + diferencaXp,
            ),
          },
        };
      });
    }

    cancelarEdicao();
  };

  const removerAtividade = (id) => {
    const atividade = atividades.find(
      (item) => item.id === id,
    );

    if (!atividade) {
      return;
    }

    if (atividade.concluida) {
      setXpTotal((xpAtual) =>
        Math.max(
          0,
          xpAtual - Number(atividade.xp),
        ),
      );
    }

    const atividadesAtualizadas = atividades.filter(
      (item) => item.id !== id,
    );

    setAtividades(atividadesAtualizadas);
    salvarHistoricoDoDia(atividadesAtualizadas);

    if (atividadeEditando === id) {
      cancelarEdicao();
    }
  };

  const limparDados = () => {
    const confirmou = window.confirm(
      "Tem certeza que deseja apagar todo o progresso?",
    );

    if (!confirmou) {
      return;
    }

    localStorage.clear();
    window.location.reload();
  };

  return (
    <main className="app">
      <header className="cabecalho">
        <div className="marca">
          <div className="icone-logo">✦</div>

          <div>
            <p className="subtitulo">
              Seu progresso começa hoje
            </p>

            <h1 className="logo">
              Level <span>UP</span>
            </h1>

            <p className="data-atual">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="nivel">
          <span>NÍVEL ATUAL</span>
          <strong>{nivel}</strong>
          <small>{xpNoNivel}/100 XP</small>
        </div>
      </header>

      <section className="estatisticas">
        <div className="card-estatistica card-xp">
          <div className="icone-estatistica">⚡</div>

          <div>
            <span>XP total</span>
            <strong>{xpTotal}</strong>
            <small>pontos acumulados</small>
          </div>
        </div>

        <div className="card-estatistica card-hoje">
          <div className="icone-estatistica">☀️</div>

          <div>
            <span>XP de hoje</span>
            <strong>{xpHoje}</strong>
            <small>pontos conquistados</small>
          </div>
        </div>

        <div className="card-estatistica card-sequencia">
          <div className="icone-estatistica">🔥</div>

          <div>
            <span>Sequência atual</span>
            <strong>{sequencia}</strong>
            <small>
              {sequencia === 1 ? "dia ativo" : "dias ativos"}
            </small>
          </div>
        </div>
      </section>

      <section className="progresso">
        <div className="titulo-progresso">
          <span>Progresso de hoje</span>
          <strong>{progressoHoje}%</strong>
        </div>

        <div className="barra">
          <div
            className="barra-preenchida"
            style={{ width: `${progressoHoje}%` }}
          />
        </div>

        <p>
          {atividadesConcluidas.length} de {atividades.length}{" "}
          atividades concluídas
        </p>
      </section>

      <section className="progresso">
        <div className="titulo-progresso">
          <span>Próximo nível</span>
          <strong>{xpNoNivel}/100 XP</strong>
        </div>

        <div className="barra">
          <div
            className="barra-preenchida nivel-barra"
            style={{ width: `${xpNoNivel}%` }}
          />
        </div>

        <p>
          {100 - xpNoNivel} XP restantes para alcançar o
          próximo nível.
        </p>
      </section>

      <section className="atividades">
        <div className="titulo-secao">
          <div>
            <span className="etiqueta-secao">
              ROTINA DIÁRIA
            </span>

            <h2>Minhas atividades</h2>
            <p>Pequenas ações. Grandes resultados.</p>
          </div>

          <span className="contador-atividades">
            {atividadesConcluidas.length}/{atividades.length}
          </span>
        </div>

        <div className="filtros-categorias">
          {categorias.map((categoria) => (
            <button
              className={
                categoriaSelecionada === categoria.nome
                  ? "filtro ativo"
                  : "filtro"
              }
              key={categoria.nome}
              onClick={() =>
                setCategoriaSelecionada(categoria.nome)
              }
              type="button"
            >
              {categoria.emoji} {categoria.nome}
            </button>
          ))}
        </div>

        <div className="lista-atividades">
          {atividadesFiltradas.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhuma atividade nesta categoria.
            </p>
          ) : (
            atividadesFiltradas.map((atividade) => {
              const categoria = obterCategoria(
                atividade.categoria,
              );

              const estaEditando =
                atividadeEditando === atividade.id;

              if (estaEditando) {
                return (
                  <form
                    className="atividade atividade-em-edicao"
                    key={atividade.id}
                    onSubmit={(evento) =>
                      salvarEdicao(evento, atividade.id)
                    }
                  >
                    <div className="campos-edicao">
                      <input
                        type="text"
                        value={nomeEditado}
                        onChange={(evento) =>
                          setNomeEditado(
                            evento.target.value,
                          )
                        }
                        placeholder="Nome da atividade"
                        autoFocus
                        required
                      />

                      <select
                        value={categoriaEditada}
                        onChange={(evento) =>
                          setCategoriaEditada(
                            evento.target.value,
                          )
                        }
                      >
                        {categoriasAtividade.map((item) => (
                          <option
                            key={item.nome}
                            value={item.nome}
                          >
                            {item.emoji} {item.nome}
                          </option>
                        ))}
                      </select>

                      <input
                        className="input-xp-edicao"
                        type="number"
                        min="0"
                        step="1"
                        value={xpEditado}
                        onChange={(evento) =>
                          setXpEditado(
                            evento.target.value,
                          )
                        }
                        placeholder="XP"
                        required
                      />
                    </div>

                    <div className="acoes-edicao">
                      <button
                        type="submit"
                        className="botao-salvar"
                      >
                        Salvar
                      </button>

                      <button
                        type="button"
                        className="botao-cancelar"
                        onClick={cancelarEdicao}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <article
                  className={
                    atividade.concluida
                      ? "atividade atividade-concluida"
                      : "atividade"
                  }
                  key={atividade.id}
                >
                  <button
                    className="botao-check"
                    onClick={() =>
                      alternarAtividade(atividade.id)
                    }
                    aria-label={
                      atividade.concluida
                        ? `Desmarcar ${atividade.nome}`
                        : `Concluir ${atividade.nome}`
                    }
                    type="button"
                  >
                    {atividade.concluida ? "✓" : ""}
                  </button>

                  <div className="informacoes-atividade">
                    <div className="linha-titulo-atividade">
                      <h3>{atividade.nome}</h3>

                      {atividade.concluida && (
                        <span className="badge-concluida">
                          Concluída
                        </span>
                      )}
                    </div>

                    <p className="categoria-atividade">
                      {categoria.emoji} {atividade.categoria}
                    </p>
                  </div>

                  <span className="xp-atividade">
                    <strong>+{atividade.xp}</strong>
                    <small>XP</small>
                  </span>

                  <div className="atividade-acoes">
                    <button
                      className="botao-editar"
                      onClick={() =>
                        iniciarEdicao(atividade)
                      }
                      aria-label={`Editar ${atividade.nome}`}
                      type="button"
                    >
                      ✎
                    </button>

                    <button
                      className="botao-remover"
                      onClick={() =>
                        removerAtividade(atividade.id)
                      }
                      aria-label={`Remover ${atividade.nome}`}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <form
          className="formulario formulario-criacao"
          onSubmit={adicionarAtividade}
        >
          <div className="campo-com-icone">
            <span>✦</span>

            <input
              type="text"
              placeholder="Nome da nova atividade..."
              value={nomeNovaAtividade}
              onChange={(evento) =>
                setNomeNovaAtividade(evento.target.value)
              }
              aria-label="Nome da nova atividade"
            />
          </div>

          <select
            value={categoriaNovaAtividade}
            onChange={(evento) =>
              setCategoriaNovaAtividade(evento.target.value)
            }
            aria-label="Categoria da atividade"
          >
            {categoriasAtividade.map((categoria) => (
              <option
                key={categoria.nome}
                value={categoria.nome}
              >
                {categoria.emoji} {categoria.nome}
              </option>
            ))}
          </select>

          <div className="campo-xp">
            <input
              type="number"
              min="0"
              step="1"
              value={xpNovaAtividade}
              onChange={(evento) =>
                setXpNovaAtividade(evento.target.value)
              }
              aria-label="Quantidade de XP"
            />

            <span>XP</span>
          </div>

          <button type="submit" className="botao-adicionar">
            <span>+</span>
            Adicionar
          </button>
        </form>
      </section>

      <section className="historico">
        <div className="titulo-secao">
          <div>
            <span className="etiqueta-secao">
              EVOLUÇÃO
            </span>

            <h2>Calendário de consistência</h2>
            <p>Seu desempenho nos últimos 30 dias.</p>
          </div>
        </div>

        <div className="calendario">
          {diasDoCalendario.map((data) => {
            const registro = historico[data];
            const eHoje = data === dataAtual;
            const percentual = registro?.progresso || 0;

            let classeDia = "dia-calendario";

            if (percentual === 100) {
              classeDia += " dia-completo";
            } else if (percentual > 0) {
              classeDia += " dia-parcial";
            }

            if (eHoje) {
              classeDia += " dia-hoje";
            }

            return (
              <div
                className={classeDia}
                key={data}
                title={`Desempenho em ${formatarData(data)}`}
              >
                <strong>{obterNomeDia(data)}</strong>
                <span>{formatarData(data)}</span>
                <b>{percentual}%</b>
              </div>
            );
          })}
        </div>

        <div className="legenda-calendario">
          <span>
            <i className="legenda nenhuma" />
            Sem registro
          </span>

          <span>
            <i className="legenda parcial" />
            Parcial
          </span>

          <span>
            <i className="legenda completo" />
            Completo
          </span>
        </div>
      </section>

      <button
        className="botao-limpar"
        onClick={limparDados}
        type="button"
      >
        <span>⚠</span>
        Apagar todos os dados
      </button>
    </main>
  );
}

export default App;
