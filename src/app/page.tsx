"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GetPokemonData, GetPokemonVars, Pokemon } from "./pokemon.types";
import { GET_POKEMON } from "./pokemon.queries";
import { getTypeStyle, setStorageWithExpiry, getStorageWithExpiry } from "./pokemon.utils";
import "./pokedex.css";

function PokemonSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("name") ?? "");
  const [debouncedTerm, setDebouncedTerm] = useState(() => searchParams.get("name") ?? "");
  const [activeTab, setActiveTab] = useState<"stats" | "attacks" | "evolutions">("stats");
  const [detailOpen, setDetailOpen] = useState(false);
  const [cachedPokemon, setCachedPokemon] = useState<Pokemon | null>(null);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync URL query param when debouncedTerm changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedTerm.trim()) {
      params.set("name", debouncedTerm.trim().toLowerCase());
    } else {
      params.delete("name");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedTerm]);

  // Close detail panel whenever pokemon changes
  useEffect(() => { setDetailOpen(false); }, [debouncedTerm]);

  // Load from localStorage if available
  useEffect(() => {
    const term = debouncedTerm.trim().toLowerCase();
    if (term) {
      const cached = getStorageWithExpiry<Pokemon>(`pokemon_${term}`);
      setCachedPokemon(cached);
    } else {
      setCachedPokemon(null);
    }

  }, [debouncedTerm]);

  const { data, loading: apolloLoading, error } = useQuery<GetPokemonData, GetPokemonVars>(
    GET_POKEMON,
    {
      variables: { name: debouncedTerm.trim().toLowerCase() },
      skip: (() => {
        const term = debouncedTerm.trim().toLowerCase();
        if (!term) return true;
        const cached = getStorageWithExpiry<Pokemon>(`pokemon_${term}`);
        return !!cached;
      })(),
    }
  );

  // Save to localStorage when new data is fetched
  useEffect(() => {
    if (data?.pokemon) {
      // Save current pokemon
      setStorageWithExpiry(`pokemon_${data.pokemon.name.toLowerCase()}`, data.pokemon);

      // Proactively save evolutions if they don't exist yet
      if (data.pokemon.evolutions) {
        data.pokemon.evolutions.forEach((evo) => {
          const key = `pokemon_${evo.name.toLowerCase()}`;
          if (!getStorageWithExpiry(key)) {
            setStorageWithExpiry(key, evo);
          }
        });
      }
    }
  }, [data]);

  const pokemon = cachedPokemon || data?.pokemon;
  const loading = apolloLoading && !cachedPokemon;
  const primaryType = pokemon?.types?.[0] ?? "Normal";
  const typeStyle = getTypeStyle(primaryType);

  const handleEvolutionClick = (name: string) => {
    setSearchTerm(name.toLowerCase());
    setDetailOpen(false);
  };

  return (
    <>
      <div
        className="pokedex-root"
        style={{
          "--type-glow": pokemon ? getTypeStyle(pokemon.types[0]).glow : "transparent",
        } as React.CSSProperties}
      >
        {/* ── TOP PANEL ── */}
        <div className="top-panel">
          <div className="top-inner">
            <div className="indicator-light" />

            <div className="pokedex-title">POKÉDEX</div>
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="error-box">⚠ Error: {error.message}</div>
        )}

        {/* ── MAIN BODY ── */}
        <div className="main-body">
          {/* ── LEFT: Primary Info ── */}
          <div className="left-panel">
            {/* Screen */}
            <div className={`screen-frame${pokemon ? " has-pokemon" : ""}`}>
              <div className="screen-topbar">
                <span className="screen-topbar-label">
                  {pokemon ? "DATA ENTRY" : "AWAITING INPUT"}
                </span>
                <span className="screen-topbar-num">
                  {pokemon ? `#${pokemon.number}` : "---"}
                </span>
              </div>

              <div className="screen-content">
                {loading && <PokedexSkeleton />}

                {!loading && !debouncedTerm && !pokemon && (
                  <div className="idle-state">
                    <svg className="idle-pokeball text-white" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path d="M2 50 Q50 50 98 50" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path d="M2 50 Q50 50 98 50" stroke="currentColor" strokeWidth="4" fill="none" transform="rotate(180,50,50)" />
                      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <p style={{ fontSize: 12, color: "#d6d6d6ff" }}>SEARCH FOR A POKÉMON TO BEGIN</p>
                  </div>
                )}

                {!loading && debouncedTerm && !pokemon && (
                  <div className="not-found">
                    <p style={{ fontSize: 12, color: "#dbd8d8ff" }}>NO DATA FOUND</p>
                    <br />
                    <span style={{ fontSize: 12, color: "#dbd8d8ff" }}>
                      CHECK SPELLING AND TRY AGAIN
                    </span>
                  </div>
                )}

                {!loading && pokemon && (
                  <div
                    className="pokemon-display"
                    style={{
                      "--type-glow": typeStyle.glow,
                    } as React.CSSProperties}
                  >
                    <div className="pokemon-name">{pokemon.name}</div>
                    <div className="pokemon-img-wrap">
                      <div className="pokemon-img-glow" />
                      <img className="pokemon-img" src={pokemon.image} alt={pokemon.name} />
                    </div>

                    <div className="classification-tag">{pokemon.classification}</div>

                    <div className="types-row">
                      {pokemon.types.map((type) => {
                        const ts = getTypeStyle(type);
                        return (
                          <span
                            key={type}
                            className="type-badge"
                            style={{ background: ts.bg, color: ts.text }}
                          >
                            {type}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT: Secondary Info ── */}
          <div
            className="right-panel"
            style={{ display: "flex", flexDirection: "column" }}
            data-open={detailOpen}
          >
            {!pokemon ? (
              <div className="panel-empty">
                <span style={{ fontSize: 14 }}>SELECT A POKÉMON TO VIEW DETAILS</span>
              </div>
            ) : (
              <>
                <div className="tab-bar">
                  {(["stats", "attacks", "evolutions"] as const).map((tab) => (
                    <button
                      key={tab}
                      className={`tab-btn${activeTab === tab ? " active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "stats" ? "STATS" : tab === "attacks" ? "ATTACKS" : "EVOLUTIONS"}
                    </button>
                  ))}
                </div>

                <div className="tab-content">
                  {/* ── STATS TAB ── */}
                  {activeTab === "stats" && (
                    <>
                      <div className="data-grid">
                        <div className="data-cell">
                          <div className="data-cell-label">HEIGHT</div>
                          <div className="data-cell-value">{pokemon.height?.minimum ?? "---"}</div>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                            → {pokemon.height?.maximum ?? "---"}
                          </div>
                        </div>
                        <div className="data-cell">
                          <div className="data-cell-label">WEIGHT</div>
                          <div className="data-cell-value">{pokemon.weight?.minimum ?? "---"}</div>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                            → {pokemon.weight?.maximum ?? "---"}
                          </div>
                        </div>
                      </div>

                      <div className="divider" />

                      <div className="stat-row">
                        <div className="stat-label-row">
                          <span className="stat-label">Max CP</span>
                          <span className="stat-value">{pokemon.maxCP}</span>
                        </div>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" style={{ width: `${Math.min(100, (pokemon.maxCP / 4000) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="stat-row">
                        <div className="stat-label-row">
                          <span className="stat-label">Max HP</span>
                          <span className="stat-value">{pokemon.maxHP}</span>
                        </div>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" style={{ width: `${Math.min(100, (pokemon.maxHP / 500) * 100)}%`, background: "linear-gradient(90deg,#388E3C,#69F0AE)" }} />
                        </div>
                      </div>

                      <div className="stat-row">
                        <div className="stat-label-row">
                          <span className="stat-label">Flee Rate</span>
                          <span className="stat-value">{(pokemon.fleeRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" style={{ width: `${pokemon.fleeRate * 100}%`, background: "linear-gradient(90deg,#F57C00,#FFD600)" }} />
                        </div>
                      </div>

                      <div className="divider" />

                      <div>
                        <div className="subsection-title">RESISTANT TO</div>
                        <div className="tag-list">
                          {pokemon.resistant.map((r) => {
                            const ts = getTypeStyle(r);
                            return (
                              <span
                                key={r}
                                className="tag-pill"
                                style={{
                                  background: `${ts.bg}22`,
                                  // borderColor: `${ts.bg}55`,
                                  color: ts.bg,
                                }}
                              >
                                {r}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="subsection-title">WEAK AGAINST</div>
                        <div className="tag-list">
                          {pokemon.weaknesses.map((w) => {
                            const ts = getTypeStyle(w);
                            return (
                              <span
                                key={w}
                                className="tag-pill"
                                style={{
                                  background: `${ts.bg}33`,
                                  borderColor: `${ts.bg}77`,
                                  color: ts.bg,
                                  boxShadow: `0 0 6px ${ts.bg}44`,
                                }}
                              >
                                {w}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── ATTACKS TAB ── */}
                  {activeTab === "attacks" && (
                    <>
                      <div className="subsection-title">FAST ATTACKS</div>
                      <div className="attack-list">
                        {!pokemon.attacks ? (
                          <div className="panel-empty" style={{ minHeight: 60 }}>LOADING ATTACKS...</div>
                        ) : (
                          pokemon.attacks.fast.map((atk) => {
                            const ts = getTypeStyle(atk.type);
                            return (
                              <div className="attack-item" key={atk.name}>
                                <div>
                                  <div className="attack-name">{atk.name}</div>
                                  <span className="attack-type" style={{ background: ts.bg, color: ts.text }}>{atk.type}</span>
                                </div>
                                <div className="attack-dmg">{atk.damage}</div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="divider" />

                      <div className="subsection-title">SPECIAL ATTACKS</div>
                      <div className="attack-list">
                        {!pokemon.attacks ? (
                          <div className="panel-empty" style={{ minHeight: 60 }}>LOADING ATTACKS...</div>
                        ) : (
                          pokemon.attacks.special.map((atk) => {
                            const ts = getTypeStyle(atk.type);
                            return (
                              <div className="attack-item" key={atk.name}>
                                <div>
                                  <div className="attack-name">{atk.name}</div>
                                  <span className="attack-type" style={{ background: ts.bg, color: ts.text }}>{atk.type}</span>
                                </div>
                                <div className="attack-dmg">{atk.damage}</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}

                  {/* ── EVOLUTIONS TAB ── */}
                  {activeTab === "evolutions" && (
                    <>
                      {(!pokemon.evolutions || pokemon.evolutions.length === 0) ? (
                        <div className="panel-empty" style={{ minHeight: 120 }}>
                          NO EVOLUTIONS<br />RECORDED
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {pokemon.evolutions.map((evo) => {
                            const evoType = evo.types?.[0] ?? "Normal";
                            const evoTs = getTypeStyle(evoType);
                            return (
                              <button
                                key={evo.id}
                                className="evo-card"
                                onClick={() => handleEvolutionClick(evo.name)}
                                style={{
                                  flex: "none",
                                  borderColor: `${evoTs.bg}44`,
                                  background: `${evoTs.bg}11`,
                                }}
                                title={`View ${evo.name}`}
                              >
                                <img className="evo-img" src={evo.image} alt={evo.name} style={{ width: 56, height: 56 }} />
                                <div className="evo-info" style={{ flex: 1 }}>
                                  <div className="evo-name" style={{ fontSize: 16, marginBottom: 4 }}>{evo.name}</div>
                                  <div className="evo-num">#{evo.number}</div>
                                  {evo.types && (
                                    <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                                      {evo.types.map((t) => {
                                        const ts = getTypeStyle(t);
                                        return (
                                          <span
                                            key={t}
                                            style={{
                                              background: ts.bg,
                                              color: ts.text,
                                              fontSize: 9,
                                              fontWeight: 700,
                                              padding: "2px 8px",
                                              borderRadius: 6,
                                              letterSpacing: "0.08em",
                                              textTransform: "uppercase",
                                            }}
                                          >
                                            {t}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  fontFamily: "'Press Start 2P', monospace",
                                  fontSize: 9,
                                  color: evoTs.bg,
                                  opacity: 0.7,
                                }}>›</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── BOTTOM PANEL (search) ── */}
        <div className="bottom-panel">
          <div className="bottom-inner">
            <span className="bottom-search-label ">SEARCH</span>
            <div className="search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search Pokémon… e.g. pikachu, charizard"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PokedexSkeleton() {
  return (
    <div className="pokedex-screen-content animate-pulse">
      <div className="skeleton-name" />
      <div className="skeleton-num" />
      <div className="skeleton-img" />
      <div className="skeleton-tags">
        <div className="skeleton-tag" />
        <div className="skeleton-tag" />
      </div>
    </div>
  );
}

export default function PokemonSearchPage() {
  return (
    <Suspense fallback={null}>
      <PokemonSearch />
    </Suspense>
  );
}