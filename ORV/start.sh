#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  start.sh — Zagon Smart Flower Locker Face 2FA sistema
#  Uporaba:
#    ./start.sh          → produkcija (Docker)
#    ./start.sh --dev    → razvojni način (brez Dockerja)
# ═══════════════════════════════════════════════════════════════
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

MODE=${1:-"--prod"}

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Smart Flower Locker — Face 2FA Zagon   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Preveri model
if [ ! -f "./model/face_model_export.pt" ]; then
    echo -e "${RED}✗ Model ni najden: ./model/face_model_export.pt${NC}"
    echo ""
    echo "  Naredi naslednje:"
    echo "  1. Pošlji sošolcu (Član 2) fajl: izvozi_model.py"
    echo "  2. Sošolec požene: python izvozi_model.py"
    echo "  3. Sošolec ti pošlje: face_model_export.pt"
    echo "  4. Kopiraj ga sem: ./model/face_model_export.pt"
    echo ""
    read -p "  Nadaljujem brez modela? (y/N): " -n 1 -r; echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
else
    echo -e "${GREEN}✓ Model najden: ./model/face_model_export.pt${NC}"
fi

if [ "$MODE" = "--dev" ]; then
    echo -e "${YELLOW}▶ Razvojni način (brez Dockerja)...${NC}"
    cd api
    pip install -r requirements.txt -q
    echo -e "${GREEN}▶ API na http://localhost:8000${NC}"
    echo -e "${GREEN}▶ Swagger: http://localhost:8000/docs${NC}"
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
    echo -e "${GREEN}▶ Gradim Docker vsebnik...${NC}"
    docker-compose build
    echo -e "${GREEN}▶ Zaganjam sistem...${NC}"
    docker-compose up -d
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ Sistem zagnan!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  API:       ${YELLOW}http://localhost:8000${NC}"
    echo -e "  Swagger:   ${YELLOW}http://localhost:8000/docs${NC}"
    echo -e "  Frontend:  ${YELLOW}http://localhost:3000${NC}"
    echo ""
    echo -e "  Ustavitev: ${YELLOW}docker-compose down${NC}"
    echo -e "  Logi:      ${YELLOW}docker-compose logs -f${NC}"
fi