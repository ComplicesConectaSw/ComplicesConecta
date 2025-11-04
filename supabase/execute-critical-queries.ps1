# Script para ejecutar queries críticas con EXPLAIN ANALYZE
# Ejecuta las queries más importantes para validar performance

$container = "supabase_db_axtvqnozatbmllvwzuim"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO QUERIES CRÍTICAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Query 1.1: Feed público ordenado por fecha" -ForegroundColor Yellow
docker exec $container psql -U postgres -d postgres -c "EXPLAIN ANALYZE SELECT id, user_id, description as content, content_type as post_type, media_url, views_count, created_at, updated_at FROM stories WHERE is_public = true ORDER BY created_at DESC LIMIT 20;"
Write-Host ""

Write-Host "Query 2.1: Perfiles con filtros básicos" -ForegroundColor Yellow
docker exec $container psql -U postgres -d postgres -c "EXPLAIN ANALYZE SELECT * FROM profiles WHERE age >= 18 AND age <= 35 AND gender = 'male' AND is_verified = true ORDER BY updated_at DESC LIMIT 20;"
Write-Host ""

Write-Host "Query 3.1: Mensajes por chat" -ForegroundColor Yellow
docker exec $container psql -U postgres -d postgres -c "EXPLAIN ANALYZE SELECT id, room_id, sender_id, content, created_at FROM messages WHERE room_id IN (SELECT id FROM chat_rooms LIMIT 1) ORDER BY created_at DESC LIMIT 50;"
Write-Host ""

Write-Host "Query 7.1: Usuarios en S2 cell" -ForegroundColor Yellow
docker exec $container psql -U postgres -d postgres -c "EXPLAIN ANALYZE SELECT * FROM profiles WHERE s2_cell_id IS NOT NULL ORDER BY updated_at DESC LIMIT 20;"
Write-Host ""

Write-Host "Query 7.3: Función get_profiles_in_cells" -ForegroundColor Yellow
docker exec $container psql -U postgres -d postgres -c "EXPLAIN ANALYZE SELECT * FROM get_profiles_in_cells((SELECT ARRAY_AGG(DISTINCT s2_cell_id) FROM profiles WHERE s2_cell_id IS NOT NULL LIMIT 3), 20);"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QUERIES EJECUTADAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

