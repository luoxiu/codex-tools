import { useEffect, useState } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import "./App.css";
import { ApiProxyPanel } from "./components/ApiProxyPanel";
import { AddAccountSection } from "./components/AddAccountSection";
import { AddAccountDialog } from "./components/AddAccountDialog";
import { AccountsGrid } from "./components/AccountsGrid";
import { AppTopBar } from "./components/AppTopBar";
import { BottomDock } from "./components/BottomDock";
import { MetaStrip } from "./components/MetaStrip";
import { NoticeBanner } from "./components/NoticeBanner";
import { RemoteDeployProgressToast } from "./components/RemoteDeployProgressToast";
import { SettingsPanel } from "./components/SettingsPanel";
import { UpdateBanner } from "./components/UpdateBanner";
import { useCodexController } from "./hooks/useCodexController";
import { useThemeMode } from "./hooks/useThemeMode";

type AppTab = "accounts" | "proxy";

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("accounts");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { themeMode, toggleTheme } = useThemeMode();
  const {
    accounts,
    loading,
    refreshing,
    addDialogOpen,
    startingAdd,
    addFlow,
    importingUpload,
    switchingId,
    pendingDeleteId,
    installingUpdate,
    updateProgress,
    pendingUpdate,
    updateDialogOpen,
    notice,
    settings,
    installedEditorApps,
    savingSettings,
    currentCount,
    apiProxyStatus,
    cloudflaredStatus,
    remoteProxyStatuses,
    remoteProxyLogs,
    remoteDeployProgress,
    startingApiProxy,
    stoppingApiProxy,
    refreshingApiProxyKey,
    refreshingRemoteProxyId,
    deployingRemoteProxyId,
    startingRemoteProxyId,
    stoppingRemoteProxyId,
    readingRemoteLogsId,
    installingDependencyName,
    installingDependencyTargetId,
    installingCloudflared,
    startingCloudflared,
    stoppingCloudflared,
    refreshUsage,
    installPendingUpdate,
    openManualDownloadPage,
    closeUpdateDialog,
    updateSettings,
    onOpenAddDialog,
    onStartAddAccount,
    onCloseAddDialog,
    onImportAuthFiles,
    loadApiProxyStatus,
    onStartApiProxy,
    onStopApiProxy,
    onRefreshApiProxyKey,
    onRefreshRemoteProxyStatus,
    onDeployRemoteProxy,
    onStartRemoteProxy,
    onStopRemoteProxy,
    onReadRemoteProxyLogs,
    onPickLocalIdentityFile,
    loadCloudflaredStatus,
    onInstallCloudflared,
    onStartCloudflared,
    onStopCloudflared,
    onDelete,
    onSwitch,
    onSmartSwitch,
    onUpdateRemoteServers,
    smartSwitching,
  } = useCodexController();

  useEffect(() => {
    let disposed = false;
    let unlisten: UnlistenFn | null = null;
    void listen("app-menu-open-settings", () => {
      setSettingsOpen(true);
    })
      .then((fn) => {
        if (disposed) {
          void fn();
          return;
        }
        unlisten = fn;
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (unlisten) {
        void unlisten();
      }
    };
  }, []);

  useEffect(() => {
    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== "r") {
        return;
      }
      const isTrigger = isMac ? event.metaKey : event.ctrlKey;
      if (!isTrigger) {
        return;
      }
      event.preventDefault();
      void refreshUsage(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [refreshUsage]);

  return (
    <div className="shell">
      <div className="ambient" />
      <main className="panel">
        <AppTopBar
          onRefresh={() => void refreshUsage(false)}
          refreshing={refreshing}
        />

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          settings={settings}
          installedEditorApps={installedEditorApps}
          savingSettings={savingSettings}
          onUpdateSettings={(patch, options) => void updateSettings(patch, options)}
        />

        <MetaStrip accountCount={accounts.length} currentCount={currentCount} />

        <AddAccountDialog
          open={addDialogOpen}
          startingAdd={startingAdd}
          addFlowActive={Boolean(addFlow)}
          importingUpload={importingUpload}
          onStartOauth={onStartAddAccount}
          onImportFiles={onImportAuthFiles}
          onClose={onCloseAddDialog}
        />

        <NoticeBanner notice={notice} />
        <RemoteDeployProgressToast progress={remoteDeployProgress} />
        <UpdateBanner
          open={updateDialogOpen}
          pendingUpdate={pendingUpdate}
          updateProgress={updateProgress}
          installingUpdate={installingUpdate}
          onClose={closeUpdateDialog}
          onManualDownload={() => void openManualDownloadPage()}
          onRetryAutoDownload={() => void installPendingUpdate()}
        />

        <section className="viewStage">
          {activeTab === "accounts" ? (
            <>
              <AddAccountSection
                startingAdd={startingAdd}
                addFlowActive={Boolean(addFlow)}
                onOpenAddDialog={onOpenAddDialog}
                onSmartSwitch={() => void onSmartSwitch()}
                smartSwitching={smartSwitching}
              />
              <AccountsGrid
                accounts={accounts}
                loading={loading}
                switchingId={switchingId}
                pendingDeleteId={pendingDeleteId}
                onSwitch={(account) => void onSwitch(account)}
                onDelete={(account) => void onDelete(account)}
              />
            </>
          ) : (
            <ApiProxyPanel
              status={apiProxyStatus}
              cloudflaredStatus={cloudflaredStatus}
              accountCount={accounts.length}
              autoStartEnabled={settings.autoStartApiProxy}
              remoteServers={settings.remoteServers}
              remoteStatuses={remoteProxyStatuses}
              remoteLogs={remoteProxyLogs}
              savingSettings={savingSettings}
              starting={startingApiProxy}
              stopping={stoppingApiProxy}
              refreshingApiKey={refreshingApiProxyKey}
              refreshingRemoteId={refreshingRemoteProxyId}
              deployingRemoteId={deployingRemoteProxyId}
              startingRemoteId={startingRemoteProxyId}
              stoppingRemoteId={stoppingRemoteProxyId}
              readingRemoteLogsId={readingRemoteLogsId}
              installingDependencyName={installingDependencyName}
              installingDependencyTargetId={installingDependencyTargetId}
              installingCloudflared={installingCloudflared}
              startingCloudflared={startingCloudflared}
              stoppingCloudflared={stoppingCloudflared}
              onStart={(port) => void onStartApiProxy(port)}
              onStop={() => void onStopApiProxy()}
              onRefreshApiKey={() => void onRefreshApiProxyKey()}
              onRefresh={() => void loadApiProxyStatus()}
              onToggleAutoStart={(enabled) =>
                void updateSettings(
                  { autoStartApiProxy: enabled },
                  { silent: true, keepInteractive: true },
                )}
              onUpdateRemoteServers={(servers) => void onUpdateRemoteServers(servers)}
              onRefreshRemoteStatus={(server) => void onRefreshRemoteProxyStatus(server)}
              onDeployRemote={(server) => void onDeployRemoteProxy(server)}
              onStartRemote={(server) => void onStartRemoteProxy(server)}
              onStopRemote={(server) => void onStopRemoteProxy(server)}
              onReadRemoteLogs={(server) => void onReadRemoteProxyLogs(server)}
              onPickLocalIdentityFile={() => onPickLocalIdentityFile()}
              onRefreshCloudflared={() => void loadCloudflaredStatus()}
              onInstallCloudflared={() => void onInstallCloudflared()}
              onStartCloudflared={(input) => void onStartCloudflared(input)}
              onStopCloudflared={() => void onStopCloudflared()}
            />
          )}
        </section>
      </main>
      <BottomDock
        activeTab={activeTab}
        settingsOpen={settingsOpen}
        onSelectTab={setActiveTab}
        onToggleSettings={() => setSettingsOpen((current) => !current)}
      />
    </div>
  );
}

export default App;
