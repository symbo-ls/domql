var movieTable = {
  $post: '/asddasdsa/dsadas',
  query: 'movies',

  on: {
    beforeDataLoad 
  }

  childProto: {
    icon: { name: 'movie' },
    title: {
      tag: 'h1',
      style: {
        
      },
      query: true,
    },
    p: {
      query: 'description',
    },
    director: {
      query: true,
    },
    actors: {
      true
      ...[,,,,]
    }
  },

  ...[,,,,]
}

{
  movies {
    title
    description
    director
    actors {

    }
  }
}