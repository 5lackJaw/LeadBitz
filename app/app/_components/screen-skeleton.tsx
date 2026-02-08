"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type ScreenScaffoldProps = {
  title: string;
  description: string;
  children: ReactNode;
  rightRail?: ReactNode;
};

type SkeletonSurfaceProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

type SkeletonTableProps = {
  columns: string[];
  rows: number;
};

type SkeletonMetricGridProps = {
  labels: string[];
};

const MOBILE_QUERY = "(max-width: 767px)";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1279px)";

export function ScreenScaffold({ title, description, children, rightRail }: ScreenScaffoldProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [tabletRailOpen, setTabletRailOpen] = useState(false);
  const tabletRailVisible = isTablet && tabletRailOpen;

  useEffect(() => {
    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    const tabletMedia = window.matchMedia(TABLET_QUERY);

    const syncViewport = () => {
      setIsMobile(mobileMedia.matches);
      setIsTablet(tabletMedia.matches);
    };

    syncViewport();
    mobileMedia.addEventListener("change", syncViewport);
    tabletMedia.addEventListener("change", syncViewport);

    return () => {
      mobileMedia.removeEventListener("change", syncViewport);
      tabletMedia.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!tabletRailVisible) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTabletRailOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [tabletRailVisible]);

  return (
    <section className="lb-screen">
      <header className="lb-screen-header">
        <div>
          <h1 className="lb-screen-title">{title}</h1>
          <p className="lb-screen-description">{description}</p>
        </div>
        {rightRail && isTablet ? (
          <button
            aria-expanded={tabletRailVisible}
            className="lb-screen-rail-toggle"
            onClick={() => setTabletRailOpen((previousValue) => !previousValue)}
            type="button"
          >
            Context panel
          </button>
        ) : null}
      </header>

      <div className="lb-screen-grid">
        <div className="lb-screen-main">{children}</div>
        {rightRail && !isTablet && !isMobile ? <aside className="lb-screen-rail">{rightRail}</aside> : null}
        {rightRail && isMobile ? <aside className="lb-screen-rail lb-screen-rail-mobile">{rightRail}</aside> : null}
      </div>

      {rightRail && isTablet ? (
        <>
          <div
            className={`lb-screen-rail-overlay-scrim${tabletRailVisible ? " lb-screen-rail-overlay-scrim-open" : ""}`}
            onClick={() => setTabletRailOpen(false)}
          />
          <aside
            aria-hidden={!tabletRailVisible}
            className={`lb-screen-rail-overlay${tabletRailVisible ? " lb-screen-rail-overlay-open" : ""}`}
          >
            <div className="lb-screen-rail-overlay-header">
              <p className="lb-screen-rail-overlay-title">Context panel</p>
              <button className="lb-screen-rail-overlay-close" onClick={() => setTabletRailOpen(false)} type="button">
                Close
              </button>
            </div>
            <div className="lb-screen-rail-overlay-content">{rightRail}</div>
          </aside>
        </>
      ) : null}
    </section>
  );
}

export function SkeletonSurface({ title, description, children }: SkeletonSurfaceProps) {
  return (
    <section className="lb-skeleton-surface">
      <header className="lb-skeleton-surface-header">
        <h2 className="lb-skeleton-surface-title">{title}</h2>
        {description ? <p className="lb-skeleton-surface-description">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function SkeletonTable({ columns, rows }: SkeletonTableProps) {
  return (
    <div className="lb-table-wrap">
      <table className="lb-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex + 1}`}>
              {columns.map((column, columnIndex) => (
                <td key={`${column}-${rowIndex + 1}`}>
                  <span
                    className={`lb-skeleton-line${columnIndex === 0 ? " lb-skeleton-line-wide" : ""}`}
                    role="presentation"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonMetricGrid({ labels }: SkeletonMetricGridProps) {
  return (
    <div className="lb-skeleton-metric-grid">
      {labels.map((label) => (
        <article className="lb-skeleton-metric" key={label}>
          <p className="lb-skeleton-metric-label">{label}</p>
          <span className="lb-skeleton-line lb-skeleton-line-wide" role="presentation" />
        </article>
      ))}
    </div>
  );
}

export function SkeletonList({ rows }: { rows: number }) {
  return (
    <ul className="lb-skeleton-list">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <li className="lb-skeleton-list-item" key={`list-row-${rowIndex + 1}`}>
          <span className="lb-skeleton-line lb-skeleton-line-wide" role="presentation" />
          <span className="lb-skeleton-line" role="presentation" />
        </li>
      ))}
    </ul>
  );
}
