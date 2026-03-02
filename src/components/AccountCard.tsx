import type { KeyboardEvent } from "react";
import type { AccountSummary } from "../types/app";
import {
  formatPlan,
  formatResetAt,
  formatWindowLabel,
  percent,
  planTone,
  remainingPercent,
  toProgressWidth,
} from "../utils/usage";

type AccountCardProps = {
  account: AccountSummary;
  isSwitching: boolean;
  isDeletePending: boolean;
  onSwitch: (account: AccountSummary) => void;
  onDelete: (account: AccountSummary) => void;
};

function LaunchIcon({ spinning }: { spinning: boolean }) {
  if (spinning) {
    return (
      <svg
        className="iconGlyph isSpinning"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
    );
  }

  return (
    <svg className="iconGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 5v14l11-7z" />
    </svg>
  );
}

export function AccountCard({
  account,
  isSwitching,
  isDeletePending,
  onSwitch,
  onDelete,
}: AccountCardProps) {
  const usage = account.usage;
  const fiveHour = usage?.fiveHour ?? null;
  const oneWeek = usage?.oneWeek ?? null;
  const normalizedPlan = account.planType || usage?.planType;
  const planLabel = formatPlan(normalizedPlan);
  const tone = planTone(normalizedPlan);
  const launchLabel = isSwitching ? "启动中" : "切换并启动";

  const handleLaunch = () => {
    if (isSwitching) return;
    onSwitch(account);
  };

  const handleLaunchKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLaunch();
    }
  };

  return (
    <article
      className={`accountCard tone-${tone} ${account.isCurrent ? "isCurrent" : ""} ${
        isSwitching ? "isSwitching" : ""
      }`}
    >
      <div className="stamps">
        <span className="stamp stampPlan">{planLabel}</span>
        {account.isCurrent && <span className="stamp stampCurrent">当前</span>}
      </div>
      <button
        className={`cardDeleteIcon ${isDeletePending ? "isPending" : ""}`}
        onClick={() => onDelete(account)}
        aria-label={isDeletePending ? "再次点击确认删除账号" : "删除账号"}
        title={isDeletePending ? "再次点击确认删除" : "删除账号"}
      >
        <svg className="iconGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
      <div className="cardHead">
        <div>
          <h3 className={account.isCurrent ? "nameCurrent" : ""}>{account.label}</h3>
        </div>
      </div>

      <div className="usageRow">
        <div className="usageTitle">
          <span>{formatWindowLabel(fiveHour, "5h")}</span>
          <div className="usageStats">
            <strong>已用 {percent(fiveHour?.usedPercent)}</strong>
            <em>剩余 {percent(remainingPercent(fiveHour))}</em>
          </div>
        </div>
        <div className="barTrack">
          <div className="barFill hot" style={{ width: toProgressWidth(fiveHour?.usedPercent) }} />
        </div>
        <small>重置时间：{formatResetAt(fiveHour?.resetAt)}</small>
      </div>

      <div className="usageRow">
        <div className="usageTitle">
          <span>{formatWindowLabel(oneWeek, "1week")}</span>
          <div className="usageStats">
            <strong>已用 {percent(oneWeek?.usedPercent)}</strong>
            <em>剩余 {percent(remainingPercent(oneWeek))}</em>
          </div>
        </div>
        <div className="barTrack">
          <div className="barFill cool" style={{ width: toProgressWidth(oneWeek?.usedPercent) }} />
        </div>
        <small>重置时间：{formatResetAt(oneWeek?.resetAt)}</small>
      </div>

      {usage?.credits && (
        <p className="credits">
          Credits: {usage.credits.unlimited ? "Unlimited" : usage.credits.balance ?? "--"}
        </p>
      )}

      {account.usageError && <p className="errorText">{account.usageError}</p>}

      <div className="cardHoverOverlay">
        <span
          className={`launchOverlayIcon ${isSwitching ? "isDisabled" : ""}`}
          role="button"
          tabIndex={isSwitching ? -1 : 0}
          onClick={handleLaunch}
          onKeyDown={handleLaunchKeyDown}
          aria-label={launchLabel}
          aria-disabled={isSwitching}
          title={isSwitching ? "启动中..." : "切换并启动"}
        >
          <LaunchIcon spinning={isSwitching} />
        </span>
      </div>
    </article>
  );
}
