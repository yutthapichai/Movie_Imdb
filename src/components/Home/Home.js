import React , { Component } from 'react'

import { API_URL, API_KEY, IMAGE_BASE_URL, POSTER_SIZE, BACKDROP_SIZE } from '../../config'
import HeroImage from '../elements/HeroImage/HeroImage'
import SearchBar from '../elements/SearchBar/SearchBar'
import FourColGrid from '../elements/FourColGrid/FourColGrid'
import MovieThumb from '../elements/MovieThumb/MovieThumb'
import LoadMoreBtn from '../elements/LoadMoreBtn/LoadMorBtn'
import Spinner from '../elements/Spinner/Spinner'
import './Home.css'

class Home extends Component {

    state = {
        movies: [],
        heroImage: null,
        loading: false,
        currentPage: 0,
        totalPage: 0,
        searchTerm: ''
    }

    searchItem = searchTerm => {
        let endpoint = ''
        this.setState({
            movies: [],
            loading:true,
            searchTerm
        })

        if(searchTerm === '') {
            endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
        } else {
            endpoint = `${API_URL}search/movie?api_key=${API_KEY}&language=en-US&query=${searchTerm}`;
        }
        this.fetchItem(endpoint)
    }

    componentDidMount() {
        if (localStorage.getItem('HomeState')) {
            const state = JSON.parse(localStorage.getItem('HomeState'))
            this.setState({ ...state })
        }else {
            this.setState({ loading: true })
            const endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`
            this.fetchItem(endpoint)
        // console.log('autofetch: ', this.state.loading)
        }
    }

    loadMoreItem = () => {
        let endpoint = ''
        this.setState({ loading: true })

        if(this.state.searchTerm === ''){
            endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=${this.state.currentPage + 1}`
        } else{
            endpoint = `${API_URL}search/movie?api_key=${API_KEY}&language=en-US&query=${this.state.searchTerm}&page=${this.state.currentPage + 1}`;
        }

        this.fetchItem(endpoint)
    }

    fetchItem = endpoint => {
        fetch(endpoint)
        .then(result => result.json())
        .then(result => {
            this.setState({
                movies: [...this.state.movies, ...result.results],
                heroImage: this.state.heroImage || result.results[0],
                loading: false,
                currentPage: result.page,
                totalPage: result.total_pages
            },() => {
                if(this.state.searchTerm === ""){
                    localStorage.setItem('Homestate', JSON.stringify(this.state))
                }
            })
            //console.log("state: ", ...this.state.movies);
        }).catch(e => console.error('Error:', e))
    }

    render() {
        return (
            <div className="rmdb-home">
                {
                    this.state.heroImage ?
                    <div>
                        <HeroImage 
                        text={this.state.heroImage.overview}
                        title={this.state.heroImage.original_title} 
                        image={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${this.state.heroImage.backdrop_path}`}/>
                        <SearchBar callback={this.searchItem}/>
                    </div> : null 
                }
                <div className="rmdb-home-grid">
                    <FourColGrid 
                    header={this.state.searchTerm ? 'search Result' : 'Popular movie'}
                    loading={this.state.loading} >
                    {
                        this.state.movies.map((element, i) => {
                        return (
                            <MovieThumb
                                key={i}
                                clickable={true}
                                image={element.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE}${element.poster_path}` : './images/no_image.jpg'}
                                movieId={element.id}
                                movieName={element.original_title}
                            />)
                        })
                    }
                    </FourColGrid>
                    { this.state.loading ? <Spinner /> : null }
                    {
                        (this.state.currentPage <= this.state.totalPage && !this.state.loading) ? 
                        <LoadMoreBtn text="Load More" onClick={this.loadMoreItem} />: null
                    }
                </div>
            </div>
        )
    }
}

export default Home