import { useState, useMemo } from 'react';
import { Copy, Check, Sliders, Sparkles, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractVariables, interpolatePrompt } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { Prompt, AIModel } from '@/types/database.types';

export interface PromptCustomizerProps {
  prompt: Prompt;
  rawPromptText: string;
  model?: AIModel | null;
}

export function PromptCustomizer({
  prompt,
  rawPromptText,
  model: _model,
}: PromptCustomizerProps) {
  const { success } = useToast();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Automatically extract variables from prompt text and merge with prompt.variables defaults
  const detectedVarNames = useMemo(() => {
    return extractVariables(rawPromptText);
  }, [rawPromptText]);

  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    detectedVarNames.forEach((name) => {
      const defined = prompt.variables?.find((v) => v.name === name);
      initial[name] = defined?.default_value || '';
    });
    return initial;
  });

  // Calculate live interpolated prompt
  const customizedPrompt = useMemo(() => {
    return interpolatePrompt(rawPromptText, variableValues);
  }, [rawPromptText, variableValues]);

  // Model-specific export templates
  const formatForModel = (modelName: string): string => {
    const ar = (prompt.settings?.aspect_ratio as string) || '16:9';
    switch (modelName.toLowerCase()) {
      case 'midjourney':
        return `${customizedPrompt} --ar ${ar} --v 6.1 --style raw`;
      case 'stable diffusion':
        return `Positive: ${customizedPrompt}\nNegative: ${prompt.negative_prompt || 'low quality, blurry, deformed'}`;
      case 'sora':
      case 'veo':
        return `Prompt: ${customizedPrompt}\nDuration: ${(prompt.settings?.duration as string) || '5s'}\nAspect Ratio: ${ar}`;
      default:
        return customizedPrompt;
    }
  };

  const handleCopy = (formatName: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedFormat(formatName);
    success(`Copied for ${formatName} with gold clearance`);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadTxt = () => {
    const content = `================================================================================
AURUM PROMPTS — CERTIFIED MASTERWORK PROMPT ASSET
Title: ${prompt.title}
Target Engine: ${prompt.model?.name || (prompt.settings?.target_engine as string) || 'AI Engine'}
Aspect Ratio: ${(prompt.settings?.aspect_ratio as string) || '16:9'}
Difficulty: ${prompt.difficulty || 'Advanced'} | License: Commercial Royalty-Free
Export Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
================================================================================

[MASTER PROMPT SYNTAX]
${customizedPrompt}

${prompt.negative_prompt ? `[NEGATIVE PROMPT PARAMETERS]\n${prompt.negative_prompt}\n\n` : ''}[CERTIFIED SETTINGS & PARAMETERS]
${Object.entries(prompt.settings || {})
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}

================================================================================
(c) Aurum Prompts Vault. All Rights Reserved. Certified for Commercial Production.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prompt.slug || 'aurum-prompt'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('Downloaded prompt text dossier (.TXT)');
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      handleDownloadTxt();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${prompt.title} — Aurum Prompts Dossier</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0A0A0B; color: #F5F5F0; padding: 25px; line-height: 1.6; }
          .header { border-bottom: 2px solid #C9A24B; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: bold; color: #C9A24B; letter-spacing: 2px; }
          .badge { background: #1C1C20; border: 1px solid #C9A24B; color: #E8D8A8; font-size: 11px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; font-family: monospace; }
          h1 { font-size: 22px; color: #FFF; margin: 10px 0 5px 0; }
          .meta { font-size: 12px; color: #888; font-family: monospace; margin-bottom: 20px; }
          .box { background: #141416; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
          .box-title { font-size: 11px; text-transform: uppercase; color: #C9A24B; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; font-family: monospace; }
          .prompt-text { font-family: "Courier New", monospace; font-size: 13px; color: #FFF; white-space: pre-wrap; line-height: 1.5; }
          .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px; font-family: monospace; }
          .setting-item { background: #1D1D20; padding: 8px; border-radius: 4px; border: 1px solid #2A2A30; }
          .footer { margin-top: 35px; padding-top: 15px; border-top: 1px solid #333; font-size: 10px; color: #666; text-align: center; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">AURUM PROMPTS</div>
          <div class="badge">Certified Commercial Dossier</div>
        </div>
        <h1>${prompt.title}</h1>
        <div class="meta">Asset Slug: ${prompt.slug} • Target Engine: ${prompt.model?.name || (prompt.settings?.target_engine as string) || 'AI Engine'} • License: Commercial Royalty-Free</div>

        <div class="box">
          <div class="box-title">Master Synthesized Prompt</div>
          <div class="prompt-text">${customizedPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>

        ${prompt.negative_prompt ? `
        <div class="box">
          <div class="box-title">Negative Prompt Parameters</div>
          <div class="prompt-text">${prompt.negative_prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}

        <div class="box">
          <div class="box-title">Certified Production Settings</div>
          <div class="settings-grid">
            <div class="setting-item"><strong>Aspect Ratio:</strong> ${(prompt.settings?.aspect_ratio as string) || '16:9'}</div>
            <div class="setting-item"><strong>Difficulty:</strong> ${prompt.difficulty || 'Advanced'}</div>
            <div class="setting-item"><strong>Target AI Engine:</strong> ${prompt.model?.name || (prompt.settings?.target_engine as string) || 'Midjourney / FLUX / Sora'}</div>
            <div class="setting-item"><strong>Entitlement Status:</strong> Verified Commercial Entitlement Pass</div>
          </div>
        </div>

        <div class="footer">
          This certified dossier constitutes proof of legal commercial entitlement under the Aurum Prompts Master License.<br/>
          (c) ${new Date().getFullYear()} Aurum Prompts Vault. All Rights Reserved.
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    success('Generated printable PDF dossier (Press Save as PDF in print dialog)');
  };

  return (
    <div className="glass-card rounded-2xl border border-gold/30 bg-surface/80 p-6 shadow-luxury">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/30 text-gold">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-text-ivory">Prompt Atelier</h3>
            <p className="text-xs text-text-muted">
              Live variable interpolation & certified model export formatting
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Variable Inputs Form */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-gold mb-2">
            Dynamic Interpolation Parameters ({detectedVarNames.length})
          </h4>

          {detectedVarNames.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-text-muted italic">
              This prompt is pre-calibrated without explicit {'{{variables}}'}. You can copy it directly
              below.
            </div>
          ) : (
            detectedVarNames.map((varName) => {
              const meta = prompt.variables?.find((v) => v.name === varName);
              const label = meta?.label || varName.replace(/_/g, ' ');
              return (
                <div key={varName} className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-ivory uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={variableValues[varName] || ''}
                    onChange={(e) =>
                      setVariableValues((prev) => ({ ...prev, [varName]: e.target.value }))
                    }
                    placeholder={meta?.default_value || `Enter ${label}...`}
                    className="w-full rounded-lg border border-white/10 bg-elevated px-3 py-2 text-sm text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              );
            })
          )}

          {/* Model Settings Pill Grid */}
          {prompt.settings && Object.keys(prompt.settings).length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block mb-2">
                Certified Settings
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(prompt.settings).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-text-muted"
                  >
                    <span className="text-gold">{k}:</span> {String(v)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Output & Multi-Model Copy Actions */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-gold">
              Live Synthesized Prompt
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              {customizedPrompt.length} characters
            </span>
          </div>

          {/* Live Preview Box */}
          <div className="relative flex-1 min-h-[160px] rounded-xl border border-white/15 bg-black/50 p-4 font-mono text-xs leading-relaxed text-text-ivory shadow-inner overflow-y-auto selection:bg-gold/30">
            {customizedPrompt}
          </div>

          {/* Multi-Format Copy Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleCopy('Default', customizedPrompt)}
                className="gap-2"
              >
                {copiedFormat === 'Default' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>Copy Full Prompt</span>
              </Button>

              <Button
                variant="glass"
                size="sm"
                onClick={() => handleCopy('Midjourney', formatForModel('midjourney'))}
                className="gap-1.5"
              >
                {copiedFormat === 'Midjourney' ? (
                  <Check className="h-3.5 w-3.5 text-gold" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                )}
                <span>Copy for Midjourney</span>
              </Button>

              <Button
                variant="glass"
                size="sm"
                onClick={() => handleCopy('Sora / Veo', formatForModel('sora'))}
                className="gap-1.5"
              >
                {copiedFormat === 'Sora / Veo' ? (
                  <Check className="h-3.5 w-3.5 text-gold" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                )}
                <span>Copy for Video (Sora/Veo)</span>
              </Button>

              {prompt.negative_prompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy('Negative', prompt.negative_prompt || '')
                  }
                  className="gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Negative</span>
                </Button>
              )}
            </div>

            {/* 1-Click Copy and File Download Actions (.TXT and .PDF) */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gold-light">
                Instant Export Dossier:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleDownloadTxt}
                  className="gap-1.5 text-xs border-white/20 hover:border-gold"
                >
                  <Download className="h-3.5 w-3.5 text-gold" />
                  <span>Download .TXT</span>
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleDownloadPdf}
                  className="gap-1.5 text-xs shadow-gold-sm font-semibold"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download .PDF Dossier</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
