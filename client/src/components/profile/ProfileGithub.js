import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getRepos } from '../../actions/profile';
import Spinner from '../layout/Spinner';

const ProfileGithub = ({ getRepos, username, repos, error }) => {
  useEffect(() => {
    getRepos(username);
  }, [getRepos, username]);

  return (
    <div className='profile-github'>
      <h2 className='text-primary my-1'>Github Repos</h2>
      {repos === null ? (
        error === null ? (
          <Spinner />
        ) : (
          <h4>{error.msg}</h4>
        )
      ) : (
        repos.map((repo) => (
          <div key={repo._id} className='repo bg-white p-1 my-1'>
            <div>
              <h4>
                <a
                  href={repo.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {' '}
                  {repo.name}{' '}
                </a>
              </h4>
              <p> {repo.description} </p>
            </div>
            <div>
              <ul>
                <li className='badge badge-primary'>
                  Stars: {repo.stargazers_count}
                </li>
                <li className='badge badge-primary'>
                  Watchers: {repo.watchers_count}
                </li>
                <li className='badge badge-primary'>
                  Forks: {repo.forks_count}
                </li>
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

ProfileGithub.propTypes = {
  getRepos: PropTypes.func.isRequired,
  repos: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  error: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  repos: state.profile.repos,
  error: state.error,
});

export default connect(mapStateToProps, { getRepos })(ProfileGithub);
