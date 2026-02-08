"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { SignOutButton } from "../sign-out-button";
import {
  DASHBOARD_ALIAS_ROUTE,
  GLOBAL_SEARCH_ITEMS,
  type GlobalSearchDomain,
  type GlobalSearchItem,
  LAST_PRIMARY_SECTION_STORAGE_KEY,
  PRIMARY_NAV_ITEMS,
  SIDEBAR_COLLAPSE_STORAGE_KEY,
  SUPPORT_FALLBACK_URL,
  type PrimaryNavItem,
} from "./app-shell.constants";

type AppShellProps = {
  children: React.ReactNode;
  userDisplayName: string;
  userEmail: string;
  workspaceName: string | null;
};

const TABLET_BREAKPOINT_QUERY = "(max-width: 1279px)";
const GLOBAL_SEARCH_DEBOUNCE_MS = 120;
const SEARCH_DOMAIN_ORDER: GlobalSearchDomain[] = ["Campaigns", "Leads", "Replies", "Settings"];

function getInitials(displayName: string, email: string) {
  const candidate = displayName.trim().length > 0 ? displayName : email;
  const words = candidate.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0]![0]!.toUpperCase();
  }

  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
}

function isItemActive(item: PrimaryNavItem, pathname: string) {
  if (item.key === "dashboard") {
    return pathname === "/app" || pathname === DASHBOARD_ALIAS_ROUTE;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShell({ children, userDisplayName, userEmail, workspaceName }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const storedValue = window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
    if (storedValue === "true" || storedValue === "false") {
      return storedValue === "true";
    }

    return window.matchMedia(TABLET_BREAKPOINT_QUERY).matches;
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(() => getInitials(userDisplayName, userEmail), [userDisplayName, userEmail]);
  const supportUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() || SUPPORT_FALLBACK_URL,
    [],
  );
  const activeNav = useMemo(
    () => PRIMARY_NAV_ITEMS.find((item) => isItemActive(item, pathname ?? "")),
    [pathname],
  );
  const searchResults = useMemo(() => {
    const normalizedQuery = debouncedSearchValue.trim().toLowerCase();
    if (!normalizedQuery) {
      return [] as GlobalSearchItem[];
    }

    return GLOBAL_SEARCH_ITEMS.filter((item) => {
      return (
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.context.toLowerCase().includes(normalizedQuery) ||
        item.domain.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [debouncedSearchValue]);
  const groupedSearchResults = useMemo(() => {
    return SEARCH_DOMAIN_ORDER
      .map((domain) => ({
        domain,
        items: searchResults.filter((item) => item.domain === domain),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchResults]);
  const hasSearchResults = searchResults.length > 0;
  const shouldShowSearchPanel = isSearchOpen && debouncedSearchValue.trim().length > 0;
  const selectedSearchIndex = hasSearchResults
    ? Math.max(-1, Math.min(activeSearchIndex, searchResults.length - 1))
    : -1;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, GLOBAL_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!activeNav) {
      return;
    }

    window.localStorage.setItem(LAST_PRIMARY_SECTION_STORAGE_KEY, activeNav.href);
  }, [activeNav]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!searchContainerRef.current?.contains(target)) {
        setIsSearchOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function navigateToSearchResult(item: GlobalSearchItem) {
    setIsSearchOpen(false);
    setSearchValue("");
    setDebouncedSearchValue("");
    setActiveSearchIndex(-1);
    router.push(item.href);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsSearchOpen(false);
      setActiveSearchIndex(-1);
      searchInputRef.current?.focus();
      return;
    }

    if (!hasSearchResults) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsSearchOpen(true);
      setActiveSearchIndex((previousIndex) => {
        if (previousIndex < 0) {
          return 0;
        }

        return (previousIndex + 1) % searchResults.length;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsSearchOpen(true);
      setActiveSearchIndex((previousIndex) => {
        if (previousIndex < 0) {
          return searchResults.length - 1;
        }

        return (previousIndex - 1 + searchResults.length) % searchResults.length;
      });
      return;
    }

    if (event.key === "Enter" && selectedSearchIndex >= 0) {
      event.preventDefault();
      navigateToSearchResult(searchResults[selectedSearchIndex]!);
    }
  }

  return (
    <div className="lb-shell">
      <header className="lb-shell-topbar">
        <div className="lb-shell-topbar-inner">
          <button
            aria-controls="lb-primary-navigation"
            aria-expanded={mobileNavOpen}
            className="lb-shell-mobile-toggle"
            onClick={() => setMobileNavOpen((previousValue) => !previousValue)}
            type="button"
          >
            Menu
          </button>

          <div className="lb-shell-search-wrap" ref={searchContainerRef}>
            <label htmlFor="lb-global-search">
              <input
                aria-activedescendant={
                  selectedSearchIndex >= 0 ? `lb-global-search-option-${selectedSearchIndex}` : undefined
                }
                aria-autocomplete="list"
                aria-controls="lb-global-search-results"
                aria-expanded={shouldShowSearchPanel}
                className="lb-input lb-shell-search-input"
                id="lb-global-search"
                name="globalSearch"
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setIsSearchOpen(true);
                  setActiveSearchIndex(-1);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search campaigns, leads, replies, settings"
                ref={searchInputRef}
                role="combobox"
                type="search"
                value={searchValue}
              />
            </label>

            {shouldShowSearchPanel ? (
              <div className="lb-shell-search-panel" id="lb-global-search-results" role="listbox">
                {hasSearchResults ? (
                  groupedSearchResults.map((group) => (
                    <section className="lb-shell-search-group" key={group.domain}>
                      <h2 className="lb-shell-search-group-title">{group.domain}</h2>
                      <ul className="lb-shell-search-group-list">
                        {group.items.map((item) => {
                          const itemIndex = searchResults.findIndex((result) => result.id === item.id);
                          const isSelected = itemIndex === selectedSearchIndex;

                          return (
                            <li key={item.id}>
                              <button
                                aria-selected={isSelected}
                                className="lb-shell-search-option"
                                data-selected={isSelected}
                                id={`lb-global-search-option-${itemIndex}`}
                                onMouseEnter={() => setActiveSearchIndex(itemIndex)}
                                onClick={() => navigateToSearchResult(item)}
                                role="option"
                                type="button"
                              >
                                <span className="lb-shell-search-option-label">{item.label}</span>
                                <span className="lb-shell-search-option-context">{item.context}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))
                ) : (
                  <p className="lb-shell-search-empty">No results found.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="lb-shell-user-context">
            <details className="lb-shell-user-menu">
              <summary className="lb-shell-user-menu-trigger">
                <span className="lb-shell-avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="lb-shell-user-label">{userDisplayName}</span>
              </summary>
              <div className="lb-shell-user-menu-panel">
                <Link className="lb-shell-user-menu-link" href="/app/settings">
                  Profile &amp; settings
                </Link>
                <SignOutButton />
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="lb-shell-body">
        <div
          className={`lb-shell-scrim${mobileNavOpen ? " lb-shell-scrim-open" : ""}`}
          onClick={() => setMobileNavOpen(false)}
        />

        <aside
          className="lb-shell-nav-region"
          data-mobile-open={mobileNavOpen}
          id="lb-primary-navigation"
          role="navigation"
        >
          <nav className="lb-shell-rail" aria-label="Navigation rail">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = isItemActive(item, pathname ?? "");
              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className="lb-shell-rail-link"
                  data-active={isActive}
                  href={item.href}
                  key={`rail-${item.key}`}
                  onClick={() => {
                    window.localStorage.setItem(LAST_PRIMARY_SECTION_STORAGE_KEY, item.href);
                    setMobileNavOpen(false);
                  }}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              );
            })}

            <button
              className="lb-shell-rail-toggle"
              onClick={() => setSidebarCollapsed((previousValue) => !previousValue)}
              type="button"
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </nav>

          <div className="lb-shell-sidebar" data-collapsed={sidebarCollapsed}>
            <div className="lb-shell-sidebar-top">
              <div className="lb-shell-brand-mark" aria-hidden="true">
                LB
              </div>
              <span className="lb-shell-sidebar-label">LeadBitz</span>
              <button
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="lb-shell-sidebar-toggle"
                onClick={() => setSidebarCollapsed((previousValue) => !previousValue)}
                type="button"
              >
                {sidebarCollapsed ? ">" : "<"}
              </button>
            </div>

            <div className="lb-shell-sidebar-main">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const isActive = isItemActive(item, pathname ?? "");
                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className="lb-shell-sidebar-link"
                    data-active={isActive}
                    href={item.href}
                    key={item.key}
                    onClick={() => {
                      window.localStorage.setItem(LAST_PRIMARY_SECTION_STORAGE_KEY, item.href);
                      setMobileNavOpen(false);
                    }}
                  >
                    <span className="lb-shell-nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="lb-shell-sidebar-link-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="lb-shell-sidebar-lower">
              <a className="lb-shell-support-entry" href={supportUrl} rel="noopener noreferrer" target="_blank">
                <span className="lb-shell-nav-icon" aria-hidden="true">
                  ?
                </span>
                <span className="lb-shell-sidebar-link-label">Support</span>
              </a>
            </div>

            <div className="lb-shell-identity-tray">
              <span className="lb-shell-avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="lb-shell-identity-copy">
                <span className="lb-shell-identity-name">{userDisplayName}</span>
                <span className="lb-shell-identity-meta">
                  Owner
                  {workspaceName ? ` | ${workspaceName}` : ""}
                </span>
              </div>
              <Link className="lb-shell-identity-settings" href="/app/settings" title="Account settings">
                A
              </Link>
            </div>
          </div>
        </aside>

        <main className="lb-shell-content" id="lb-primary-content">
          <div className="lb-shell-content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
