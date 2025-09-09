package com.DA2.Repparton.Config;

import com.DA2.Repparton.Entity.*;
import com.DA2.Repparton.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private SongRepo songRepo;

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private GenreRepo genreRepo;

    @Autowired
    private PlaylistRepo playlistRepo;

    @Autowired
    private FollowRepo followRepo;

    @Autowired
    private LikeRepo likeRepo;

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private StoryRepo storyRepo;

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepo.count() == 0) {
            System.out.println("🚀 Initializing Repparton database with real data...");

            initializeGenres();
            initializeUsers();
            initializeSongs();
            initializePosts();
            initializePlaylists();
            initializeFollows();
            initializeLikes();
            initializeComments();
            initializeStories();
            initializeNotifications();

            System.out.println("✅ Database initialization completed successfully!");
        } else {
            System.out.println("📊 Database already contains data, skipping initialization");
        }
    }

    private void initializeGenres() {
        System.out.println("🎵 Creating music genres...");

        Genre pop = new Genre();
        pop.setName("Pop");
        pop.setDescription("Popular mainstream music");

        Genre rock = new Genre();
        rock.setName("Rock");
        rock.setDescription("Rock and roll music");

        Genre hipHop = new Genre();
        hipHop.setName("Hip Hop");
        hipHop.setDescription("Hip hop and rap music");

        Genre electronic = new Genre();
        electronic.setName("Electronic");
        electronic.setDescription("Electronic dance music");

        Genre jazz = new Genre();
        jazz.setName("Jazz");
        jazz.setDescription("Jazz and blues music");

        Genre classical = new Genre();
        classical.setName("Classical");
        classical.setDescription("Classical orchestral music");

        Genre country = new Genre();
        country.setName("Country");
        country.setDescription("Country and folk music");

        Genre rnb = new Genre();
        rnb.setName("R&B");
        rnb.setDescription("Rhythm and blues music");

        Genre reggae = new Genre();
        reggae.setName("Reggae");
        reggae.setDescription("Reggae and caribbean music");

        Genre alternative = new Genre();
        alternative.setName("Alternative");
        alternative.setDescription("Alternative and indie music");

        List<Genre> genres = Arrays.asList(pop, rock, hipHop, electronic, jazz, classical, country, rnb, reggae, alternative);

        genreRepo.saveAll(genres);
        System.out.println("✅ Created " + genres.size() + " genres");
    }

    private void initializeUsers() {
        System.out.println("👥 Creating sample users...");

        // Admin user
        User admin = new User("admin", "admin@repparton.com", passwordEncoder.encode("admin123"));
        admin.setBio("Platform Administrator");
        admin.setRole("admin");
        admin.setAvatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face");
        admin.setCoverUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop");
        admin.setArtistPending(false);
        admin.setCreatedAt(LocalDateTime.now().minusDays(30));

        // Artists
        User taylorSwift = new User("taylor_swift_official", "taylor@repparton.com", passwordEncoder.encode("password123"));
        taylorSwift.setBio("Singer-songwriter from Nashville. Lover of cats, lyrics, and storytelling 🎵");
        taylorSwift.setRole("artist");
        taylorSwift.setAvatarUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face");
        taylorSwift.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop");
        taylorSwift.setArtistPending(false);
        taylorSwift.setCreatedAt(LocalDateTime.now().minusDays(25));

        User edSheeran = new User("ed_sheeran", "ed@repparton.com", passwordEncoder.encode("password123"));
        edSheeran.setBio("British singer-songwriter. Mathematics is my latest album ➕➖✖️➗");
        edSheeran.setRole("artist");
        edSheeran.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face");
        edSheeran.setCoverUrl("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop");
        edSheeran.setArtistPending(false);
        edSheeran.setCreatedAt(LocalDateTime.now().minusDays(20));

        User billie = new User("billie_eilish", "billie@repparton.com", passwordEncoder.encode("password123"));
        billie.setBio("18. i make music and stuff. happier than ever 💚");
        billie.setRole("artist");
        billie.setAvatarUrl("https://images.unsplash.com/photo-1494790108755-2616c79f95bb?w=400&h=400&fit=crop&crop=face");
        billie.setCoverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop");
        billie.setArtistPending(false);
        billie.setCreatedAt(LocalDateTime.now().minusDays(18));

        User theWeeknd = new User("theweeknd", "weeknd@repparton.com", passwordEncoder.encode("password123"));
        theWeeknd.setBio("The Weeknd XO 🖤 Dawn FM out now");
        theWeeknd.setRole("artist");
        theWeeknd.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face");
        theWeeknd.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop");
        theWeeknd.setArtistPending(false);
        theWeeknd.setCreatedAt(LocalDateTime.now().minusDays(15));

        // Regular users
        User musicLover1 = new User("music_lover_sarah", "sarah@example.com", passwordEncoder.encode("password123"));
        musicLover1.setBio("Music enthusiast 🎧 Always discovering new artists and sharing great songs!");
        musicLover1.setRole("user");
        musicLover1.setAvatarUrl("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face");
        musicLover1.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop");
        musicLover1.setArtistPending(false);
        musicLover1.setCreatedAt(LocalDateTime.now().minusDays(12));

        User musicLover2 = new User("alex_beats", "alex@example.com", passwordEncoder.encode("password123"));
        musicLover2.setBio("DJ and music producer from LA 🎛️ Electronic music is life!");
        musicLover2.setRole("user");
        musicLover2.setAvatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face");
        musicLover2.setCoverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop");
        musicLover2.setArtistPending(true);
        musicLover2.setCreatedAt(LocalDateTime.now().minusDays(10));

        User musicLover3 = new User("indie_rock_mike", "mike@example.com", passwordEncoder.encode("password123"));
        musicLover3.setBio("Indie rock guitarist 🎸 Coffee addict ☕ Always jamming!");
        musicLover3.setRole("user");
        musicLover3.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face");
        musicLover3.setCoverUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop");
        musicLover3.setArtistPending(false);
        musicLover3.setCreatedAt(LocalDateTime.now().minusDays(8));

        List<User> users = Arrays.asList(admin, taylorSwift, edSheeran, billie, theWeeknd,
                                        musicLover1, musicLover2, musicLover3);
        userRepo.saveAll(users);
        System.out.println("✅ Created " + users.size() + " users");
    }

    private void initializeSongs() {
        System.out.println("🎵 Creating sample songs...");

        User taylor = userRepo.findByUsername("taylor_swift_official").orElse(null);
        User ed = userRepo.findByUsername("ed_sheeran").orElse(null);
        User billie = userRepo.findByUsername("billie_eilish").orElse(null);
        User weeknd = userRepo.findByUsername("theweeknd").orElse(null);

        if (taylor == null || ed == null || billie == null || weeknd == null) return;

        List<Genre> genres = genreRepo.findAll();
        String popGenre = genres.stream().filter(g -> g.getName().equals("Pop")).findFirst().map(Genre::getId).orElse("");
        String alternativeGenre = genres.stream().filter(g -> g.getName().equals("Alternative")).findFirst().map(Genre::getId).orElse("");

        // Taylor Swift songs
        Song loveStory = new Song("Love Story (2023 Version)", taylor.getId());
        loveStory.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        loveStory.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop");
        loveStory.setPrivate(false);
        loveStory.setStatus("approved");
        loveStory.setViews(1250000);
        loveStory.setLikes(45000);
        loveStory.setShares(8500);
        loveStory.setGenreIds(List.of(popGenre));
        loveStory.setCreatedAt(LocalDateTime.now().minusDays(15));

        Song antiHero = new Song("Anti-Hero", taylor.getId());
        antiHero.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        antiHero.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop");
        antiHero.setPrivate(false);
        antiHero.setStatus("approved");
        antiHero.setViews(2100000);
        antiHero.setLikes(78000);
        antiHero.setShares(15000);
        antiHero.setGenreIds(Arrays.asList(popGenre, alternativeGenre));
        antiHero.setCreatedAt(LocalDateTime.now().minusDays(12));

        // Ed Sheeran songs
        Song shapeOfYou = new Song("Shape of You (Acoustic)", ed.getId());
        shapeOfYou.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        shapeOfYou.setCoverUrl("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop");
        shapeOfYou.setPrivate(false);
        shapeOfYou.setStatus("approved");
        shapeOfYou.setViews(1800000);
        shapeOfYou.setLikes(67000);
        shapeOfYou.setShares(12000);
        shapeOfYou.setGenreIds(List.of(popGenre));
        shapeOfYou.setCreatedAt(LocalDateTime.now().minusDays(10));

        Song perfect = new Song("Perfect", ed.getId());
        perfect.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        perfect.setCoverUrl("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop");
        perfect.setPrivate(false);
        perfect.setStatus("approved");
        perfect.setViews(3200000);
        perfect.setLikes(125000);
        perfect.setShares(25000);
        perfect.setGenreIds(List.of(popGenre));
        perfect.setCreatedAt(LocalDateTime.now().minusDays(8));

        // Billie Eilish songs
        Song badGuy = new Song("bad guy", billie.getId());
        badGuy.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        badGuy.setCoverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop");
        badGuy.setPrivate(false);
        badGuy.setStatus("approved");
        badGuy.setViews(2800000);
        badGuy.setLikes(98000);
        badGuy.setShares(18000);
        badGuy.setGenreIds(Arrays.asList(alternativeGenre, popGenre));
        badGuy.setCreatedAt(LocalDateTime.now().minusDays(6));

        Song happierThanEver = new Song("Happier Than Ever", billie.getId());
        happierThanEver.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        happierThanEver.setCoverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop");
        happierThanEver.setPrivate(false);
        happierThanEver.setStatus("approved");
        happierThanEver.setViews(1900000);
        happierThanEver.setLikes(72000);
        happierThanEver.setShares(13500);
        happierThanEver.setGenreIds(List.of(alternativeGenre));
        happierThanEver.setCreatedAt(LocalDateTime.now().minusDays(4));

        // The Weeknd songs
        Song blindingLights = new Song("Blinding Lights", weeknd.getId());
        blindingLights.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        blindingLights.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop");
        blindingLights.setPrivate(false);
        blindingLights.setStatus("approved");
        blindingLights.setViews(4500000);
        blindingLights.setLikes(189000);
        blindingLights.setShares(35000);
        blindingLights.setGenreIds(List.of(popGenre));
        blindingLights.setCreatedAt(LocalDateTime.now().minusDays(3));

        Song saveYourTears = new Song("Save Your Tears", weeknd.getId());
        saveYourTears.setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        saveYourTears.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop");
        saveYourTears.setPrivate(false);
        saveYourTears.setStatus("approved");
        saveYourTears.setViews(2600000);
        saveYourTears.setLikes(95000);
        saveYourTears.setShares(17500);
        saveYourTears.setGenreIds(List.of(popGenre));
        saveYourTears.setCreatedAt(LocalDateTime.now().minusDays(2));

        List<Song> songs = Arrays.asList(loveStory, antiHero, shapeOfYou, perfect, badGuy, happierThanEver, blindingLights, saveYourTears);

        songRepo.saveAll(songs);
        System.out.println("✅ Created " + songs.size() + " songs");
    }

    private void initializePosts() {
        System.out.println("📱 Creating sample posts...");

        User taylor = userRepo.findByUsername("taylor_swift_official").orElse(null);
        User ed = userRepo.findByUsername("ed_sheeran").orElse(null);
        User sarah = userRepo.findByUsername("music_lover_sarah").orElse(null);
        User alex = userRepo.findByUsername("alex_beats").orElse(null);

        if (taylor == null || ed == null || sarah == null || alex == null) return;

        Post post1 = new Post();
        post1.setUserId(taylor.getId());
        post1.setContent("Just finished recording my new acoustic version of Love Story! Can't wait for you all to hear it 🎸✨ #TaylorSwift #LoveStory #Acoustic");
        post1.setMediaUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop");
        post1.setMediaType("IMAGE");
        post1.setPrivate(false);
        post1.setLikes(125000);
        post1.setShares(8500);
        post1.setCreatedAt(LocalDateTime.now().minusDays(5));

        Post post2 = new Post();
        post2.setUserId(ed.getId());
        post2.setContent("Behind the scenes in the studio working on something special 🎤 Mathematics era isn't over yet! What's your favorite track from the album?");
        post2.setMediaUrl("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop");
        post2.setMediaType("IMAGE");
        post2.setPrivate(false);
        post2.setLikes(89000);
        post2.setShares(4200);
        post2.setCreatedAt(LocalDateTime.now().minusDays(3));

        Post post3 = new Post();
        post3.setUserId(sarah.getId());
        post3.setContent("Currently obsessed with this playlist! 🎧 Perfect for late night studying sessions. What are you listening to tonight? Drop your recommendations below! 👇");
        post3.setMediaUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop");
        post3.setMediaType("IMAGE");
        post3.setPrivate(false);
        post3.setLikes(342);
        post3.setShares(28);
        post3.setCreatedAt(LocalDateTime.now().minusDays(2));

        Post post4 = new Post();
        post4.setUserId(alex.getId());
        post4.setContent("New electronic beats dropping this weekend! 🔥🎛️ Been working on this track for months and finally ready to share. Electronic music lovers, this one's for you!");
        post4.setMediaUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop");
        post4.setMediaType("IMAGE");
        post4.setPrivate(false);
        post4.setLikes(567);
        post4.setShares(89);
        post4.setCreatedAt(LocalDateTime.now().minusDays(1));

        Post post5 = new Post();
        post5.setUserId(taylor.getId());
        post5.setContent("Thank you for all the love on Anti-Hero! 💜 Your support means everything to me. Already working on the next surprise... 👀 #Swifties #AntiHero");
        post5.setPrivate(false);
        post5.setLikes(245000);
        post5.setShares(15000);
        post5.setCreatedAt(LocalDateTime.now().minusHours(12));

        List<Post> posts = Arrays.asList(post1, post2, post3, post4, post5);

        postRepo.saveAll(posts);
        System.out.println("✅ Created " + posts.size() + " posts");
    }

    private void initializePlaylists() {
        System.out.println("🎵 Creating sample playlists...");

        User sarah = userRepo.findByUsername("music_lover_sarah").orElse(null);
        User alex = userRepo.findByUsername("alex_beats").orElse(null);
        User mike = userRepo.findByUsername("indie_rock_mike").orElse(null);

        if (sarah == null || alex == null || mike == null) return;

        List<Song> songs = songRepo.findAll();
        List<String> allSongIds = songs.stream().map(Song::getId).toList();

        Playlist playlist1 = new Playlist();
        playlist1.setName("Late Night Vibes");
        playlist1.setDescription("Perfect songs for those late night study sessions and chill moments 🌙");
        playlist1.setUserId(sarah.getId());
        playlist1.setPrivate(false);
        playlist1.setSongIds(allSongIds.subList(0, Math.min(4, allSongIds.size())));
        playlist1.setCoverUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop");
        playlist1.setCreatedAt(LocalDateTime.now().minusDays(7));

        Playlist playlist2 = new Playlist();
        playlist2.setName("Electronic Bangers");
        playlist2.setDescription("High energy electronic tracks that get you moving 🔥⚡");
        playlist2.setUserId(alex.getId());
        playlist2.setPrivate(false);
        playlist2.setSongIds(allSongIds.subList(2, Math.min(6, allSongIds.size())));
        playlist2.setCoverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop");
        playlist2.setCreatedAt(LocalDateTime.now().minusDays(5));

        Playlist playlist3 = new Playlist();
        playlist3.setName("Indie Rock Essentials");
        playlist3.setDescription("Must-have indie rock tracks for any music lover 🎸");
        playlist3.setUserId(mike.getId());
        playlist3.setPrivate(false);
        playlist3.setSongIds(allSongIds.subList(1, Math.min(5, allSongIds.size())));
        playlist3.setCoverUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop");
        playlist3.setCreatedAt(LocalDateTime.now().minusDays(3));

        List<Playlist> playlists = Arrays.asList(playlist1, playlist2, playlist3);

        playlistRepo.saveAll(playlists);
        System.out.println("✅ Created " + playlists.size() + " playlists");
    }

    private void initializeFollows() {
        System.out.println("👥 Creating follow relationships...");

        List<User> users = userRepo.findAll();
        User taylor = users.stream().filter(u -> u.getUsername().equals("taylor_swift_official")).findFirst().orElse(null);
        User ed = users.stream().filter(u -> u.getUsername().equals("ed_sheeran")).findFirst().orElse(null);
        User billie = users.stream().filter(u -> u.getUsername().equals("billie_eilish")).findFirst().orElse(null);
        User sarah = users.stream().filter(u -> u.getUsername().equals("music_lover_sarah")).findFirst().orElse(null);
        User alex = users.stream().filter(u -> u.getUsername().equals("alex_beats")).findFirst().orElse(null);

        if (taylor == null || ed == null || billie == null || sarah == null || alex == null) return;

        // Sarah follows all artists
        Follow follow1 = new Follow(sarah.getId(), taylor.getId());
        follow1.setCreatedAt(LocalDateTime.now().minusDays(10));

        Follow follow2 = new Follow(sarah.getId(), ed.getId());
        follow2.setCreatedAt(LocalDateTime.now().minusDays(9));

        Follow follow3 = new Follow(sarah.getId(), billie.getId());
        follow3.setCreatedAt(LocalDateTime.now().minusDays(8));

        // Alex follows electronic and pop artists
        Follow follow4 = new Follow(alex.getId(), taylor.getId());
        follow4.setCreatedAt(LocalDateTime.now().minusDays(7));

        Follow follow5 = new Follow(alex.getId(), billie.getId());
        follow5.setCreatedAt(LocalDateTime.now().minusDays(6));

        // Artists follow each other
        Follow follow6 = new Follow(taylor.getId(), ed.getId());
        follow6.setCreatedAt(LocalDateTime.now().minusDays(15));

        Follow follow7 = new Follow(ed.getId(), taylor.getId());
        follow7.setCreatedAt(LocalDateTime.now().minusDays(14));

        Follow follow8 = new Follow(billie.getId(), taylor.getId());
        follow8.setCreatedAt(LocalDateTime.now().minusDays(13));

        List<Follow> follows = Arrays.asList(follow1, follow2, follow3, follow4, follow5, follow6, follow7, follow8);

        followRepo.saveAll(follows);
        System.out.println("✅ Created " + follows.size() + " follow relationships");
    }

    private void initializeLikes() {
        System.out.println("❤️ Creating likes...");

        List<User> users = userRepo.findAll();
        List<Song> songs = songRepo.findAll();
        List<Post> posts = postRepo.findAll();

        // Create realistic likes for songs and posts
        for (User user : users) {
            // Each user likes 3-5 random songs - sử dụng constructor với songId
            for (int i = 0; i < 4 && i < songs.size(); i++) {
                Song song = songs.get(i);
                Like like = new Like(user.getId(), song.getId());
                like.setCreatedAt(LocalDateTime.now().minusDays(i + 1));
                likeRepo.save(like);
            }

            // Each user likes 2-3 random posts - sử dụng constructor với postId
            for (int i = 0; i < 3 && i < posts.size(); i++) {
                Post post = posts.get(i);
                if (!post.getUserId().equals(user.getId())) { // Don't like own posts
                    Like like = new Like(user.getId(), post.getId(), true);
                    like.setCreatedAt(LocalDateTime.now().minusDays(i + 1));
                    likeRepo.save(like);
                }
            }
        }

        System.out.println("✅ Created likes for songs and posts");
    }

    private void initializeComments() {
        System.out.println("💬 Creating comments...");

        List<User> users = userRepo.findAll();
        List<Song> songs = songRepo.findAll();
        List<Post> posts = postRepo.findAll();

        User sarah = users.stream().filter(u -> u.getUsername().equals("music_lover_sarah")).findFirst().orElse(null);
        User alex = users.stream().filter(u -> u.getUsername().equals("alex_beats")).findFirst().orElse(null);

        if (sarah == null || alex == null || songs.isEmpty() || posts.isEmpty()) return;

        // Comments on songs - sử dụng constructor với songId
        Comment comment1 = new Comment(sarah.getId(), songs.get(0).getId(), "This is absolutely beautiful! The acoustic version hits different 🥺");
        comment1.setCreatedAt(LocalDateTime.now().minusDays(2));

        Comment comment2 = new Comment(alex.getId(), songs.get(1).getId(), "The production on this track is insane! Love the vocals too 🔥");
        comment2.setCreatedAt(LocalDateTime.now().minusDays(1));

        // Comments on posts - sử dụng constructor với postId
        Comment comment3 = new Comment(sarah.getId(), posts.get(0).getId(), "Can't wait to hear it! Your acoustic versions are always amazing ✨", true);
        comment3.setCreatedAt(LocalDateTime.now().minusHours(18));

        Comment comment4 = new Comment(alex.getId(), posts.get(1).getId(), "Mathematics is such a masterpiece! Every track is gold 🏆", true);
        comment4.setCreatedAt(LocalDateTime.now().minusHours(12));

        List<Comment> comments = Arrays.asList(comment1, comment2, comment3, comment4);

        commentRepo.saveAll(comments);
        System.out.println("✅ Created " + comments.size() + " comments");
    }

    private void initializeStories() {
        System.out.println("📸 Creating stories...");

        User taylor = userRepo.findByUsername("taylor_swift_official").orElse(null);
        User billie = userRepo.findByUsername("billie_eilish").orElse(null);
        User alex = userRepo.findByUsername("alex_beats").orElse(null);

        if (taylor == null || billie == null || alex == null) return;

        Story story1 = new Story();
        story1.setUserId(taylor.getId());
        story1.setContent("Recording new vocals today! 🎤");
        story1.setMediaUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop");
        story1.setType("IMAGE");
        story1.setViews(89000);
        story1.setLikes(12500);
        story1.setCreatedAt(LocalDateTime.now().minusHours(6));
        story1.setExpiresAt(LocalDateTime.now().plusHours(18));

        Story story2 = new Story();
        story2.setUserId(billie.getId());
        story2.setContent("Studio vibes ✨");
        story2.setMediaUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=800&fit=crop");
        story2.setType("IMAGE");
        story2.setViews(67000);
        story2.setLikes(9800);
        story2.setCreatedAt(LocalDateTime.now().minusHours(4));
        story2.setExpiresAt(LocalDateTime.now().plusHours(20));

        Story story3 = new Story();
        story3.setUserId(alex.getId());
        story3.setContent("New beat preview 🔥");
        story3.setMediaUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=800&fit=crop");
        story3.setType("IMAGE");
        story3.setViews(3400);
        story3.setLikes(567);
        story3.setCreatedAt(LocalDateTime.now().minusHours(2));
        story3.setExpiresAt(LocalDateTime.now().plusHours(22));

        List<Story> stories = Arrays.asList(story1, story2, story3);

        storyRepo.saveAll(stories);
        System.out.println("✅ Created " + stories.size() + " stories");
    }

    private void initializeNotifications() {
        System.out.println("🔔 Creating notifications...");

        List<User> users = userRepo.findAll();
        User sarah = users.stream().filter(u -> u.getUsername().equals("music_lover_sarah")).findFirst().orElse(null);
        User alex = users.stream().filter(u -> u.getUsername().equals("alex_beats")).findFirst().orElse(null);
        User taylor = users.stream().filter(u -> u.getUsername().equals("taylor_swift_official")).findFirst().orElse(null);

        if (sarah == null || alex == null || taylor == null) return;

        Notification notification1 = new Notification(sarah.getId(), "New Song Alert!", "taylor_swift_official just released a new song!", "NEW_SONG");
        notification1.setReferenceId(taylor.getId());
        notification1.setRead(false);
        notification1.setCreatedAt(LocalDateTime.now().minusHours(3));

        Notification notification2 = new Notification(alex.getId(), "Post Liked", "Someone liked your post!", "POST_LIKE");
        notification2.setReferenceId("post-id");
        notification2.setRead(false);
        notification2.setCreatedAt(LocalDateTime.now().minusHours(1));

        Notification notification3 = new Notification(taylor.getId(), "New Follower", "music_lover_sarah started following you", "NEW_FOLLOWER");
        notification3.setReferenceId(sarah.getId());
        notification3.setRead(true);
        notification3.setCreatedAt(LocalDateTime.now().minusDays(2));

        List<Notification> notifications = Arrays.asList(notification1, notification2, notification3);

        notificationRepo.saveAll(notifications);
        System.out.println("✅ Created " + notifications.size() + " notifications");
    }
}
