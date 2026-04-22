"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Trash2, ClipboardPaste, Check, Info, Hash, ListTree } from 'lucide-react';

/**
 * CORE LOGIC: Фильтрация данных. 
 * Регулярные выражения настроены на стандартные форматы WMS.
 */
const extractData = (text: string, mode: 'barcode' | 'sticker'): string[] => {
  if (!text) return [];
  // ШК: только цифры (12-20 знаков). Стикеры: буквы и цифры (6-15 знаков).
  const regex = mode === 'barcode' ? /\b\d{12,20}\b/g : /\b[A-Z0-9-]{6,20}\b/gi;
  return text.match(regex) || [];
};

export default function SeparatorTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'barcode' | 'sticker'>('barcode');
  const [keepUnique, setKeepUnique] = useState(true);
  const [copied, setCopied] = useState(false);

  // Вычисления (useMemo оптимизирует производительность при больших списках)
  const result = useMemo(() => {
    const extracted = extractData(input, mode);
    return keepUnique ? [...new Set(extracted)] : extracted;
  }, [input, mode, keepUnique]);

  const handleCopy = async () => {
    if (result.length === 0) return;
    await navigator.clipboard.writeText(result.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error("Не удалось вставить из буфера", err);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER: Заголовок и основные переключатели */}
      <div className="flex flex-col gap-5 border-b border-border/40 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Выделитель ШК / Стикеров
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Профессиональный инструмент для моментальной очистки списков из WMS отчетов. 
            Просто вставьте текст, и система сама найдет нужные коды.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Переключатель режима */}
            <div className="inline-flex rounded-xl bg-muted/50 p-1 border border-border/50 shadow-inner">
              <button
                onClick={() => setMode('barcode')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  mode === 'barcode' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hash className="h-4 w-4" /> ШК
              </button>
              <button
                onClick={() => setMode('sticker')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  mode === 'sticker' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListTree className="h-4 w-4" /> Стикер
              </button>
            </div>

            {/* Чекбокс Уникальности */}
            <label className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/50 px-4 py-2 text-sm font-medium hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={keepUnique}
                onChange={(e) => setKeepUnique(e.target.checked)}
                className="h-4 w-4 rounded-md border-border bg-muted text-primary ring-offset-background focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-foreground/80 group-hover:text-foreground">Уникальные</span>
            </label>
          </div>

          {/* Индикатор количества */}
          {result.length > 0 && (
            <div className="flex items-center gap-2 animate-in zoom-in-95">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Найдено кодов:</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                {result.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN: Рабочая область */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Блок ввода */}
        <div className="group flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Входящие данные</span>
            <div className="flex gap-2">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold bg-muted/80 hover:bg-muted text-foreground border border-border/50 transition-all active:scale-95"
              >
                <ClipboardPaste className="h-3.5 w-3.5" /> Вставить
              </button>
              <button
                onClick={() => setInput('')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> Очистить
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Вставьте сюда любой текст с кодами из Excel или WMS..."
              className="h-[450px] w-full resize-none rounded-2xl border border-border/60 bg-card/40 px-5 py-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all scrollbar-thin shadow-sm group-hover:border-border"
            />
          </div>
        </div>

        {/* Блок вывода */}
        <div className="group flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Очищенный результат</span>
            <button
              onClick={handleCopy}
              disabled={result.length === 0}
              className={`flex items-center gap-2 rounded-lg px-5 py-1.5 text-xs font-extrabold transition-all active:scale-95 shadow-sm ${
                copied 
                ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:grayscale'
              }`}
            >
              {copied ? <><Check className="h-4 w-4" /> Скопировано!</> : <><Copy className="h-4 w-4" /> Копировать всё</>}
            </button>
          </div>

          <div className="relative h-[450px] w-full overflow-hidden rounded-2xl border border-border/60 bg-card/20 backdrop-blur-[2px] group-hover:border-border transition-all">
             <div className="h-full w-full overflow-y-auto p-0 font-mono text-[13px] leading-relaxed scrollbar-thin">
                {result.length > 0 ? (
                  result.map((item, idx) => (
                    <div key={idx} className="flex border-b border-border/5 last:border-0 hover:bg-primary/[0.03] transition-colors">
                      <span className="w-12 shrink-0 select-none py-2 text-center text-[10px] font-bold text-muted-foreground/30 bg-muted/20 border-r border-border/5">
                        {idx + 1}
                      </span>
                      <span className="px-4 py-2 text-foreground/90 tabular-nums tracking-tight">
                        {item}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/30 opacity-60">
                    <Info className="h-10 w-10 stroke-[1px]" />
                    <p className="text-sm italic font-medium">Ожидание данных...</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* FOOTER: Подсказка */}
      <div className="flex items-start gap-4 rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-5 animate-in fade-in duration-1000 delay-500">
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-blue-900/90 dark:text-blue-100/90">Как это работает?</p>
          <p className="text-xs leading-relaxed text-blue-700/70 dark:text-blue-300/60">
            Алгоритм автоматически игнорирует названия столбцов, артикулы и другой текст, вычленяя только цифровые 
            идентификаторы (ШК) или системные буквенно-цифровые коды (Стикеры). Идеально подходит для работы со списками из сотен позиций.
          </p>
        </div>
      </div>
    </div>
  );
}
