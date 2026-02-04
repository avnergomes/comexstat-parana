import { Database, Github, Linkedin, Globe, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-dark-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-500" />
              Fonte dos Dados
            </h3>
            <p className="text-sm leading-relaxed">
              Dados extraidos do sistema{' '}
              <a
                href="https://comexstat.mdic.gov.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
              >
                ComexStat
                <ExternalLink className="w-3 h-3" />
              </a>{' '}
              do Ministerio do Desenvolvimento, Industria, Comercio e Servicos (MDIC).
            </p>
            <p className="text-sm mt-2 text-dark-400">
              Filtragem: Estado do Parana (PR), Capitulos NCM 01-24 (Agricultura)
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Uteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://comexstat.mdic.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  ComexStat - Portal Oficial
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.br/mdic/pt-br/assuntos/comercio-exterior/estatisticas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  Estatisticas MDIC
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://datageoparana.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  Datageo Parana
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <h3 className="text-white font-semibold mb-4">Desenvolvedor</h3>
            <p className="text-sm mb-3">Avner Gomes</p>
            <div className="flex gap-3">
              <a
                href="https://github.com/avnergomes"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/avnergomes"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://avnergomes.github.io/portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                aria-label="Portfolio"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dark-400">
          <p>&copy; {currentYear} ComexStat Parana Dashboard. Dados publicos.</p>
          <p>Atualizado em Janeiro de 2026</p>
        </div>
      </div>
    </footer>
  );
}
