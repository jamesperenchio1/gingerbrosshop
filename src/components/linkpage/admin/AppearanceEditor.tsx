import { Plus, Trash2 } from 'lucide-react';
import { FONT_OPTIONS, SOCIAL_LABELS, SOCIAL_TYPES, type LinkPageConfig, type SocialType } from '@/lib/linkpage';
import { ColorField, Field, ImageField, Segmented, TextField, Toggle, inputClass } from './fields';

type Props = { config: LinkPageConfig; onChange: (c: LinkPageConfig) => void };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-soft-peach p-4 space-y-4">
      <h3 className="font-display text-[18px] text-deep-brown">{title}</h3>
      {children}
    </section>
  );
}

export default function AppearanceEditor({ config, onChange }: Props) {
  const { profile, theme } = config;
  const setProfile = (p: Partial<LinkPageConfig['profile']>) => onChange({ ...config, profile: { ...profile, ...p } });
  const setTheme = (t: Partial<LinkPageConfig['theme']>) => onChange({ ...config, theme: { ...theme, ...t } });
  const setBg = (b: Partial<LinkPageConfig['theme']['background']>) => setTheme({ background: { ...theme.background, ...b } });

  return (
    <div className="space-y-4">
      <Section title="Profile">
        <ImageField label="Profile photo" value={profile.avatarUrl} onChange={(avatarUrl) => setProfile({ avatarUrl })} maxSize={400} round />
        <TextField label="Name" value={profile.name} onChange={(name) => setProfile({ name })} />
        <TextField label="Bio" value={profile.bio} onChange={(bio) => setProfile({ bio })} multiline />
      </Section>

      <Section title="Social icons">
        {config.socials.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={s.type}
              onChange={(e) => onChange({ ...config, socials: config.socials.map((x, j) => (j === i ? { ...x, type: e.target.value as SocialType } : x)) })}
              className={`${inputClass} w-36 shrink-0`}
            >
              {SOCIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SOCIAL_LABELS[t]}
                </option>
              ))}
            </select>
            <input
              value={s.url}
              onChange={(e) => onChange({ ...config, socials: config.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
              className={inputClass}
            />
            <button
              type="button"
              aria-label="Remove"
              onClick={() => onChange({ ...config, socials: config.socials.filter((_, j) => j !== i) })}
              className="p-2 text-earth hover:text-rust"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...config, socials: [...config.socials, { type: 'line', url: 'https://' }] })}
          className="flex items-center gap-1.5 font-body text-[13px] text-deep-brown hover:text-rust"
        >
          <Plus className="w-4 h-4" /> Add icon
        </button>
      </Section>

      <Section title="Background">
        <Segmented
          label="Type"
          value={theme.background.type}
          options={[
            { value: 'color', label: 'Solid' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'image', label: 'Image' },
          ]}
          onChange={(type) => setBg({ type })}
        />
        <div className="grid grid-cols-2 gap-3">
          <ColorField label={theme.background.type === 'gradient' ? 'Top colour' : 'Colour'} value={theme.background.color} onChange={(color) => setBg({ color })} />
          {theme.background.type === 'gradient' && <ColorField label="Bottom colour" value={theme.background.color2} onChange={(color2) => setBg({ color2 })} />}
        </div>
        {theme.background.type === 'image' && (
          <ImageField label="Background image" value={theme.background.imageUrl} onChange={(imageUrl) => setBg({ imageUrl })} maxSize={1600} />
        )}
      </Section>

      <Section title="Buttons">
        <Segmented
          label="Style"
          value={theme.buttonStyle}
          options={[
            { value: 'fill', label: 'Fill' },
            { value: 'outline', label: 'Outline' },
            { value: 'soft-shadow', label: 'Soft shadow' },
            { value: 'hard-shadow', label: 'Hard shadow' },
          ]}
          onChange={(buttonStyle) => setTheme({ buttonStyle })}
        />
        <Segmented
          label="Corners"
          value={theme.corner}
          options={[
            { value: 'square', label: 'Square' },
            { value: 'sm', label: 'Rounded' },
            { value: 'md', label: 'Round' },
            { value: 'pill', label: 'Pill' },
          ]}
          onChange={(corner) => setTheme({ corner })}
        />
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Button colour" value={theme.buttonColor} onChange={(buttonColor) => setTheme({ buttonColor })} />
          <ColorField label="Button text" value={theme.buttonTextColor} onChange={(buttonTextColor) => setTheme({ buttonTextColor })} />
        </div>
      </Section>

      <Section title="Text">
        <Field label="Font">
          <select value={theme.font} onChange={(e) => setTheme({ font: e.target.value as LinkPageConfig['theme']['font'] })} className={inputClass}>
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <ColorField label="Text colour" value={theme.textColor} onChange={(textColor) => setTheme({ textColor })} />
      </Section>

      <Section title="Page">
        <TextField
          label="Browser tab / share title"
          value={config.seo.title}
          onChange={(title) => onChange({ ...config, seo: { ...config.seo, title } })}
        />
        <Toggle label="Show Subscribe button" checked={config.showSubscribeButton} onChange={(showSubscribeButton) => onChange({ ...config, showSubscribeButton })} />
        <Toggle label="Show Share button" checked={config.showShareButton} onChange={(showShareButton) => onChange({ ...config, showShareButton })} />
      </Section>
    </div>
  );
}
