import React, { Fragment} from 'react';
export default function Page(props) {

  return (
    <Fragment>
      <main>{props.children}</main>
    </Fragment>
  );
}
;