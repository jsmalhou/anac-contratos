# ============================================================
#  ANAC Contratos - Atualizar para v2.0
#  Este script forca a atualizacao do codigo do GitHub
# ============================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ANAC Contratos - Atualizacao v2.0" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = "C:\Apps\Anac\GestaoContratos\anac-contratos"

# Verificar se a pasta existe
if (-not (Test-Path $projectDir)) {
    Write-Host "ERRO: Pasta nao encontrada: $projectDir" -ForegroundColor Red
    Write-Host "Verifique o caminho do projeto." -ForegroundColor Red
    pause
    exit 1
}

Set-Location $projectDir

# --- PASSO 1: Verificar Git ---
Write-Host "[1/6] A verificar Git..." -ForegroundColor Yellow
try {
    git --version | Out-Null
    Write-Host "      Git OK!" -ForegroundColor Green
} catch {
    Write-Host "      ERRO: Git nao encontrado!" -ForegroundColor Red
    Write-Host "      Instale em: https://git-scm.com/download/win" -ForegroundColor Red
    pause
    exit 1
}

# --- PASSO 2: Forcar atualizacao do codigo ---
Write-Host "[2/6] A atualizar codigo do GitHub..." -ForegroundColor Yellow
Write-Host "      A fazer git fetch..." -ForegroundColor Gray
git fetch origin main 2>&1 | Out-Null

Write-Host "      A forcar atualizacao (git reset)..." -ForegroundColor Gray
git reset --hard origin/main 2>&1 | Out-Null

Write-Host "      Codigo atualizado!" -ForegroundColor Green

# --- PASSO 3: Instalar dependencias ---
Write-Host "[3/6] A instalar dependencias (sweetalert2)..." -ForegroundColor Yellow
npm install 2>&1 | Out-Null
Write-Host "      Dependencias instaladas!" -ForegroundColor Green

# --- PASSO 4: Atualizar base de dados ---
Write-Host "[4/6] A atualizar base de dados..." -ForegroundColor Yellow
$env:DATABASE_URL = "mysql://root:root@localhost:3306/anac_contratos"
npx drizzle-kit push 2>&1 | Out-Null
Write-Host "      Base de dados atualizada!" -ForegroundColor Green

# --- PASSO 5: Popular dados ---
Write-Host "[5/6] A popular dados de exemplo..." -ForegroundColor Yellow
npx tsx db/seed.ts 2>&1 | Out-Null
Write-Host "      Dados populados!" -ForegroundColor Green

# --- PASSO 6: Iniciar servidor ---
Write-Host "[6/6] A iniciar servidor..." -ForegroundColor Yellow
Write-Host "" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ATUALIZACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "A app vai abrir em: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Novidades na v2.0:" -ForegroundColor Yellow
Write-Host "  - Fornecedores (menu sidebar)" -ForegroundColor White
Write-Host "  - Departamentos (em Configuracoes)" -ForegroundColor White
Write-Host "  - Funcoes (em Configuracoes)" -ForegroundColor White
Write-Host "  - Perfil do utilizador" -ForegroundColor White
Write-Host "  - Edicao de contratos" -ForegroundColor White
Write-Host "  - SweetAlert (janelas bonitas)" -ForegroundColor White
Write-Host "  - Formulario 90% largura" -ForegroundColor White
Write-Host ""
Write-Host "Credenciais de teste:" -ForegroundColor Yellow
Write-Host "  admin@anac.ao / admin123" -ForegroundColor Cyan
Write-Host "  gestor@anac.ao / gestor123" -ForegroundColor Cyan
Write-Host "  financeiro@anac.ao / fin123" -ForegroundColor Cyan
Write-Host ""

npm run dev
