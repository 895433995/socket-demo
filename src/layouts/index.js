import styles from './index.css';

function BasicLayout(props) {
  return (
    <div className={styles.normal}>
      <h1 className={styles.title}>SocketDemo</h1>
      {props.children}
    </div>
  );
}

export default BasicLayout;
