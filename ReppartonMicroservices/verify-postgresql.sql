-- ================================================
-- POSTGRESQL VERIFICATION SCRIPT
-- Repparton Microservices
-- ================================================

-- Connect to PostgreSQL
-- psql -U postgres

\echo '================================================'
\echo 'CHECKING POSTGRESQL DATABASES'
\echo '================================================'

-- List all Repparton databases
SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname LIKE 'repparton%'
ORDER BY datname;

\echo ''
\echo '================================================'
\echo 'USERS DATABASE'
\echo '================================================'
\c repparton_users

-- Check tables
\dt

-- Count users
SELECT 'Total Users:' as info, COUNT(*) as count FROM users;

-- Show recent users
SELECT id, username, email, first_name, last_name, is_artist, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Check user roles
SELECT 'Total User Roles:' as info, COUNT(*) as count FROM user_roles;

\echo ''
\echo '================================================'
\echo 'SONGS DATABASE'
\echo '================================================'
\c repparton_songs

-- Check tables
\dt

-- Count songs
SELECT 'Total Songs:' as info, COUNT(*) as count FROM songs;

-- Show recent songs
SELECT id, title, artist_name, genre, play_count, like_count, created_at
FROM songs
ORDER BY created_at DESC
LIMIT 5;

-- Songs by genre
SELECT genre, COUNT(*) as count
FROM songs
GROUP BY genre
ORDER BY count DESC;

-- Most played songs
SELECT title, artist_name, play_count, like_count
FROM songs
ORDER BY play_count DESC
LIMIT 5;

\echo ''
\echo '================================================'
\echo 'PLAYLISTS DATABASE'
\echo '================================================'
\c repparton_playlists

-- Check tables
\dt

-- Count playlists
SELECT 'Total Playlists:' as info, COUNT(*) as count FROM playlists;

-- Show recent playlists
SELECT id, name, user_id, followers_count, created_at
FROM playlists
ORDER BY created_at DESC
LIMIT 5;

-- Check playlist songs junction table
SELECT 'Total Playlist-Song Relations:' as info, COUNT(*) as count FROM playlist_songs;

-- Popular playlists
SELECT p.name, p.followers_count, COUNT(ps.song_id) as song_count
FROM playlists p
LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
GROUP BY p.id, p.name, p.followers_count
ORDER BY p.followers_count DESC
LIMIT 5;

\echo ''
\echo '================================================'
\echo 'SOCIAL DATABASE'
\echo '================================================'
\c repparton_social

-- Check tables
\dt

-- Count follows
SELECT 'Total Follows:' as info, COUNT(*) as count FROM follows;

-- Recent follows
SELECT follower_id, following_id, created_at
FROM follows
ORDER BY created_at DESC
LIMIT 5;

-- Count likes
SELECT 'Total Likes:' as info, COUNT(*) as count FROM likes;

-- Likes by type
SELECT target_type, COUNT(*) as count
FROM likes
GROUP BY target_type
ORDER BY count DESC;

-- Recent likes
SELECT user_id, target_type, target_id, created_at
FROM likes
ORDER BY created_at DESC
LIMIT 5;

-- Count shares
SELECT 'Total Shares:' as info, COUNT(*) as count FROM shares;

\echo ''
\echo '================================================'
\echo 'DATABASE SIZES'
\echo '================================================'
\c postgres

SELECT 
    datname as "Database",
    pg_size_pretty(pg_database_size(datname)) as "Size",
    (SELECT count(*) FROM pg_stat_activity WHERE datname = d.datname) as "Active Connections"
FROM pg_database d
WHERE datname LIKE 'repparton%'
ORDER BY pg_database_size(datname) DESC;

\echo ''
\echo '================================================'
\echo 'TABLE SIZES'
\echo '================================================'

\c repparton_users
SELECT 
    'users' as table_name,
    pg_size_pretty(pg_total_relation_size('users')) as total_size,
    pg_size_pretty(pg_relation_size('users')) as table_size,
    pg_size_pretty(pg_indexes_size('users')) as indexes_size;

\c repparton_songs
SELECT 
    'songs' as table_name,
    pg_size_pretty(pg_total_relation_size('songs')) as total_size,
    pg_size_pretty(pg_relation_size('songs')) as table_size,
    pg_size_pretty(pg_indexes_size('songs')) as indexes_size;

\c repparton_playlists
SELECT 
    'playlists' as table_name,
    pg_size_pretty(pg_total_relation_size('playlists')) as total_size,
    pg_size_pretty(pg_relation_size('playlists')) as table_size,
    pg_size_pretty(pg_indexes_size('playlists')) as indexes_size;

\c repparton_social
SELECT 
    'follows' as table_name,
    pg_size_pretty(pg_total_relation_size('follows')) as total_size,
    pg_size_pretty(pg_relation_size('follows')) as table_size,
    pg_size_pretty(pg_indexes_size('follows')) as indexes_size
UNION ALL
SELECT 
    'likes' as table_name,
    pg_size_pretty(pg_total_relation_size('likes')) as total_size,
    pg_size_pretty(pg_relation_size('likes')) as table_size,
    pg_size_pretty(pg_indexes_size('likes')) as indexes_size;

\echo ''
\echo '================================================'
\echo 'INDEXES'
\echo '================================================'

\c repparton_users
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'user_roles')
ORDER BY tablename, indexname;

\c repparton_songs
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'songs'
ORDER BY indexname;

\c repparton_social
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('follows', 'likes', 'shares')
ORDER BY tablename, indexname;

\echo ''
\echo '================================================'
\echo 'PERFORMANCE STATISTICS'
\echo '================================================'

\c repparton_users
SELECT 
    relname as table_name,
    seq_scan as sequential_scans,
    seq_tup_read as rows_read_sequentially,
    idx_scan as index_scans,
    idx_tup_fetch as rows_fetched_by_index
FROM pg_stat_user_tables
WHERE relname IN ('users', 'user_roles')
ORDER BY relname;

\c repparton_songs
SELECT 
    relname as table_name,
    seq_scan,
    idx_scan,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
WHERE relname = 'songs';

\echo ''
\echo '================================================'
\echo 'VERIFICATION COMPLETE'
\echo '================================================'
