"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Minus,
  Sparkles,
  Eye,
  Edit3,
  Check,
  HelpCircle,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface RichPostEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichPostEditor: React.FC<RichPostEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = "280px",
}) => {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const text = linkText.trim() || linkUrl.trim();
    const snippet = `<a href="${linkUrl.trim()}" class="text-[#C45B2A] hover:underline font-bold" target="_blank" rel="noopener noreferrer">${text}</a>`;
    insertText(snippet, "", "");
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    const alt = imageAlt.trim() || "XSPEED Logistics Insights";
    const snippet = `\n<figure class="my-6">\n  <img src="${imageUrl.trim()}" alt="${alt}" class="w-full rounded-2xl shadow-md border border-gray-100 object-cover max-h-[420px]" loading="lazy" />\n  <figcaption class="text-xs text-gray-500 text-center mt-2 font-medium">${alt}</figcaption>\n</figure>\n`;
    insertText(snippet, "", "");
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
  };

  const insertTable = () => {
    const tableSnippet = `\n<div class="overflow-x-auto my-6">\n  <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden text-xs sm:text-sm">\n    <thead class="bg-gray-50 text-gray-900 font-bold">\n      <tr>\n        <th class="px-4 py-3 text-start">الخدمة / البند</th>\n        <th class="px-4 py-3 text-start">زمن العبور</th>\n        <th class="px-4 py-3 text-start">نطاق التغطية</th>\n      </tr>\n    </thead>\n    <tbody class="divide-y divide-gray-100 bg-white">\n      <tr>\n        <td class="px-4 py-3 font-semibold text-gray-900">شحن جوي سريع (NFO)</td>\n        <td class="px-4 py-3 text-gray-600">24-48 ساعة</td>\n        <td class="px-4 py-3 text-gray-600">220+ دولة</td>\n      </tr>\n      <tr>\n        <td class="px-4 py-3 font-semibold text-gray-900">تخليص جمركي عبر نافذة</td>\n        <td class="px-4 py-3 text-gray-600">24 ساعة</td>\n        <td class="px-4 py-3 text-gray-600">مطار القاهرة والموانئ المصرية</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n`;
    insertText(tableSnippet, "", "");
  };

  const insertCallout = () => {
    const callout = `\n<div class="bg-gradient-to-r from-orange-50 to-orange-100/50 border-r-4 border-[#C45B2A] rounded-2xl p-5 my-6 text-gray-800 space-y-2">\n  <h4 class="font-bold text-[#C45B2A] text-sm">💡 توصية لوجستية هامة:</h4>\n  <p class="text-xs sm:text-sm leading-relaxed">احرص دائماً على استخراج رقم التسجيل المسبق للشحنات ACI قبل شحن الحاويات لتفادي غرامات الموانئ وتأخير الإفراج الجمركي.</p>\n</div>\n`;
    insertText(callout, "", "");
  };

  const wordCount = (value || "")
    .replace(/<[^>]*>?/gm, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden flex flex-col text-start">
      {/* Top Bar: Write vs Live Preview Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50/90 border-b border-gray-200 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "write"
                ? "bg-white text-[#C45B2A] shadow-xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isRTL ? "محرر التنسيق المتقدم" : "Rich Editor"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-emerald-600 shadow-xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isRTL ? "معاينة حية للمقال" : "Live HTML Preview"}</span>
          </button>
        </div>

        {/* Live Word Count Metric */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
          <span>{wordCount} {isRTL ? "كلمة" : "words"}</span>
          <span className="text-gray-300">•</span>
          <span>{value?.length || 0} {isRTL ? "حرف" : "chars"}</span>
        </div>
      </div>

      {/* Editor Toolbar (Visible in Write Mode) */}
      {activeTab === "write" && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-100 text-gray-700">
          {/* Headings */}
          <button
            type="button"
            onClick={() => insertText("<h2>", "</h2>", isRTL ? "عنوان رئيسي H2" : "Heading 2")}
            title="Heading 2 (H2)"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer text-xs font-black"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertText("<h3>", "</h3>", isRTL ? "عنوان فرعي H3" : "Heading 3")}
            title="Heading 3 (H3)"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer text-xs font-bold"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertText("<h4>", "</h4>", isRTL ? "عنوان قسم H4" : "Heading 4")}
            title="Heading 4 (H4)"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer text-xs font-semibold"
          >
            H4
          </button>

          <span className="w-px h-4 bg-gray-200 mx-1" />

          {/* Text Styling */}
          <button
            type="button"
            onClick={() => insertText("<strong>", "</strong>", isRTL ? "نص عريض" : "bold text")}
            title="Bold"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("<em>", "</em>", isRTL ? "نص مائل" : "italic text")}
            title="Italic"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("<del>", "</del>", isRTL ? "نص مشطوب" : "strikethrough")}
            title="Strikethrough"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() =>
              insertText(
                "<ul>\n  <li>",
                "</li>\n  <li>العنصر الثاني</li>\n</ul>",
                isRTL ? "العنصر الأول" : "First Item"
              )
            }
            title="Bullet List"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertText(
                "<ol>\n  <li>",
                "</li>\n  <li>الخطوة الثانية</li>\n</ol>",
                isRTL ? "الخطوة الأولى" : "Step 1"
              )
            }
            title="Numbered List"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-200 mx-1" />

          {/* Blockquote & Callout */}
          <button
            type="button"
            onClick={() =>
              insertText(
                '<blockquote class="border-r-4 border-[#C45B2A] pr-4 my-4 italic text-gray-700 bg-orange-50/40 p-3 rounded-l-xl">\n  "',
                '"\n</blockquote>',
                isRTL ? "اقتباس قيادي أو رأي خبير..." : "Quote from industry expert..."
              )
            }
            title="Blockquote"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertCallout}
            title="Highlight Callout Box"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer text-xs font-bold text-amber-700 bg-amber-50"
          >
            💡 {isRTL ? "مربع تمييز" : "Callout"}
          </button>

          <span className="w-px h-4 bg-gray-200 mx-1" />

          {/* Links, Images, Tables */}
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            title="Insert Link"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{isRTL ? "رابط" : "Link"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="Insert Image"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{isRTL ? "صورة" : "Image"}</span>
          </button>
          <button
            type="button"
            onClick={insertTable}
            title="Insert Table"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{isRTL ? "جدول" : "Table"}</span>
          </button>
          <button
            type="button"
            onClick={() => insertText("<hr />\n", "")}
            title="Horizontal Divider"
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#C45B2A] transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Link Insertion Sub-Modal */}
      {showLinkModal && (
        <div className="p-3 bg-orange-50/70 border-b border-orange-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
          <input
            type="text"
            placeholder={isRTL ? "نص الرابط (اختياري)..." : "Anchor text..."}
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-full sm:w-1/3"
          />
          <input
            type="url"
            placeholder="https://exspeeds.com/services/air-freight"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-full sm:flex-1 font-mono"
            dir="ltr"
          />
          <div className="flex gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleInsertLink}
              className="bg-[#C45B2A] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#A34920] transition-colors text-xs"
            >
              {isRTL ? "إدراج" : "Insert"}
            </button>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors text-xs"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Image Insertion Sub-Modal */}
      {showImageModal && (
        <div className="p-3 bg-blue-50/70 border-b border-blue-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
          <input
            type="text"
            placeholder={isRTL ? "وصف الصورة (Alt Text)..." : "Image caption / alt..."}
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-full sm:w-1/3"
          />
          <input
            type="url"
            placeholder="/assets/xspeed_plane.jpg or https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-full sm:flex-1 font-mono"
            dir="ltr"
          />
          <div className="flex gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleInsertImage}
              className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              {isRTL ? "إدراج الصورة" : "Insert Image"}
            </button>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors text-xs"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Main Body: Textarea or Live Preview */}
      {activeTab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            (isRTL
              ? "اكتب محتوى المقال هنا مع استخدام أدوات التنسيق بالأعلى (H2, H3, قوائم, جداول, صور)..."
              : "Write formatted article body with headings, lists, tables, and images...")
          }
          style={{ minHeight }}
          className="w-full p-4 text-xs sm:text-sm font-mono text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none leading-relaxed resize-y"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="p-6 bg-[#FAF8F5] overflow-y-auto max-h-[460px] text-gray-800 space-y-4 prose prose-orange max-w-none text-start text-xs sm:text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html:
              value ||
              `<p class="text-gray-400 italic">${
                isRTL ? "لا يوجد محتوى للمعاينة بعد. ابدأ بكتابة المقال في التبويب الآخر." : "No content to preview yet. Switch back to editor to compose."
              }</p>`,
          }}
        />
      )}
    </div>
  );
};
