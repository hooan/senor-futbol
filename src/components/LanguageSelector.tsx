import { useTranslation } from 'react-i18next'

export default function LanguageSelector() {
  const { i18n } = useTranslation()

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="flex items-center gap-2 border-thin border-raw-black bg-white">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-2 font-mono text-xs uppercase transition-colors ${
          i18n.language === 'en'
            ? 'bg-raw-black text-white'
            : 'hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-2 font-mono text-xs uppercase transition-colors ${
          i18n.language === 'es'
            ? 'bg-raw-black text-white'
            : 'hover:bg-gray-100'
        }`}
      >
        ES
      </button>
    </div>
  )
}
